<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Helpers;
use Illuminate\Database\QueryException;

class UserController extends Controller
{
    /**
     * Register a new user, returns a user_id via json response and an api
     * token via cookies
     */
    public function register(Request $request)
    {
        $this->validate($request, [
            'username' => 'required|string|min:4|max:32|unique:users',
            'password' => 'required|string|min:8|max:256',
            'email' => 'required|string|email|min:3|max:256'
        ]);

        app('db')->beginTransaction();

        try {
            $email_verification_code = Helpers::generateRandomString(32);
            $email = $request->input('email');

            // Insert email for user
            $email_id = app('db')->table('emails')->insertGetId([
                'email' => $email,
                'verification_code' => $email_verification_code
            ]);

            // Insert user into users table
            $user_id = app('db')->table('users')->insertGetId([
                'username' => $request->input('username'),
                'password_hash' => password_hash($request->input('password'), PASSWORD_DEFAULT),
                'email_id' => $email_id
            ]);

            // Send verification email
            mail($email, 'Verify email address', "Use the following code to verify your email address: ".$email_verification_code);

            app('db')->commit();
        } catch (QueryException $e) {
            app('db')->rollBack();
            return response()->json(['error' => 'Internal server error'], 500);
        }

        if ($user_id) {
            // Add user id to response
            $response = response()->json(['user_id' => (string) $user_id]);

            // Generate api token for this user and attach to response as cookie
            $api_token = $this->generateApiToken($user_id);
            $response->cookie(new Cookie('api_token', $api_token));

            return $response;
        } else {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Validate a username and password, returns a user_id via json response and an
     * api token via cookies
     */
    public function login(Request $request)
    {
        $this->validate($request, [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Determine if given username and password is valid
        $user = app('db')->table('users')
            ->select('id', 'password_hash')
            ->where('username', $request->input('username'))
            ->first();
        
        if ($user) {
            // If the given password matches the given users password
            if (password_verify($request->input('password'), $user->password_hash)) {
                // Add user id to response
                $response = response()->json(['user_id' => (string) $user->id]);

                // Generate api token for this user and attach to response as cookie
                $api_token = $this->generateApiToken($user->id);
                $response->cookie(new Cookie('api_token', $api_token));

                return $response;
            }
        }

        return response()->json(['error' => 'Invalid login credentials'], 401);
    }

    /**
     * Generates a new api token for the given user
     * 
     * @param string $user_id The user to generate the api token for
     * @return string The generated api token
     */
    private function generateApiToken($user_id) {
        // Create a unique token that has never been used
        $already_exists = true;
        while ($already_exists) {
            $api_token = Helpers::generateRandomString(32);
            $already_exists = app('db')->table('api_tokens')->where('token', $api_token)->exists();
        }

        // Add token to api_tokens table for given user
        app('db')->table('api_tokens')->insert([
            'token' => $api_token,
            'user_id' => $user_id
        ]);

        return $api_token;
    }

    /**
     * Update a user's password
     */
    public function updatePassword(Request $request)
    {
        $this->validate($request, [
            'password' => 'required|string|min:8|max:256',
            'current_password' => 'required_without:forgot_password_code|string',
            'user_id' => 'required_with:current_password|string',
            'forgot_password_code' => 'required_without:current_password|string|size:32'
        ]);

        // If current password is set, make sure it is the right password for the given user id
        if ($request->has('current_password')) {
            $password_hash = app('db')->table('users')
                ->select('password_hash')
                ->where('id', $request->input('user_id'))
                ->value('password_hash');
            
            // Ensure current password is correct
            if (!password_verify($request->input('current_password'), $password_hash)) {
                return response()->json(['error' => 'Current password is incorrect'], 400);
            }
        } else {
            // If the current password isn't set, that means forgot password code is, see
            // if we can find what user the code is for
            $user_id = app('db')->table('forgot_password_codes')
                ->where('code', $request->input('forgot_password_code'))
                ->where('used', 0)
                ->value('user_id');
            
            if ($user_id) {
                // Forgot pass code is valid, mark it as used
                app('db')->table('forgot_password_codes')
                    ->where('code', $request->input('forgot_password_code'))
                    ->where('used', 0)
                    ->where('user_id', $user_id)
                    ->update(['used' => 1]);
            } else {
                return response()->json(['error' => 'Forgot password code not found'], 400);
            }
        }

        // Change password
        app('db')->table('users')
            ->where('id', $request->input('user_id') ?? $user_id)
            ->update(['password_hash' => password_hash($request->input('password'), PASSWORD_DEFAULT)]);

        return response()->json((object)[]);
    }

    /**
     * Create a forgot password request, sends an email to the supplied email with instructions
     * to reset password
     */
    public function forgotPassword(Request $request) {
        $this->validate($request, [
            'username' => 'required|string',
            'email' => 'required|string'
        ]);

        // Look for user with supplied username and email
        $user = app('db')->table('users')
            ->join('emails', 'users.email_id', '=', 'emails.id')
            ->select('users.id', 'emails.email')
            ->where('users.username', $request->input('username'))
            ->where('emails.email', $request->input('email'))
            ->first();

        if ($user) {
            // Generate unique forgot password code for this user
            $forgot_password_code = $this->generateForgotPasswordCode($user->id);

            // Send forgot password email
            mail($user->email, 'Forgot password', "Use the following code to reset your password: ".$forgot_password_code);

            return response()->json((object)[]);
        }
        
        return response()->json(['error' => 'Could not find that user'], 400);
    }

    /**
     * Generates a new forgot password code for the given user
     * 
     * @param string $user_id The user to generate the forgot password code for
     * @return string The generated forgot password code
     */
    private function generateForgotPasswordCode($user_id) {
        // Create a unique forgot password code that has never been used
        $already_exists = true;
        while ($already_exists) {
            $forgot_password_code = Helpers::generateRandomString(32);
            $already_exists = app('db')->table('forgot_password_codes')->where('code', $forgot_password_code)->exists();
        }

        // Add forgot password code to forgot_password_codes table for given user
        app('db')->table('forgot_password_codes')->insert([
            'code' => $forgot_password_code,
            'user_id' => $user_id
        ]);

        return $forgot_password_code;
    }
}

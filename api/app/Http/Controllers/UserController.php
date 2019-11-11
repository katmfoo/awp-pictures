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
            mail($email, 'Verify email address', "Click the below link to verify your email address for Patrick Richeal's advanced web programming picture project.\n\n".env('APP_URL').'/emails/verify/'.$email_verification_code);

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
        $user_id = app('db')->table('api_tokens')->insert([
            'token' => $api_token,
            'user_id' => $user_id
        ]);

        return $api_token;
    }
}

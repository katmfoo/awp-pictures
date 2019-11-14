<?php

namespace App\Http\Controllers;

class EmailController extends Controller
{
    /**
     * Verify an email
     */
    public function verify($verification_code)
    {
        // Check what email this verification code is for (if any)
        $verification_code_exists = app('db')->table('users')->where('email_verification_code', $verification_code)->exists();
        
        // If verification code is valid, mark email as verified
        if ($verification_code_exists) {
            app('db')->table('users')
                ->where('email_verification_code', $verification_code)
                ->update(['email_verified' => 1]);
            
            return response()->json((object)[]);
        }

        return response()->json(['error' => 'Verification code not found'], 400);
    }
}

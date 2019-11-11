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
        $email = app('db')->table('emails')->where('verification_code', $verification_code)->value('email');
        
        // If verification code is valid, mark email as verified
        if ($email) {
            app('db')->table('emails')
                ->where('verification_code', $verification_code)
                ->update(['verified' => 1]);
        }

        return view('email_verify', ['email' => $email]);
    }
}

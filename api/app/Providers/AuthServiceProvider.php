<?php

namespace App\Providers;
use Illuminate\Support\ServiceProvider;

/*
 * file - api/app/Providers/AuthServiceProvider.php
 * author - Patrick Richeal
 * 
 * Auth service provider file, service is used by the auth middleware (defined in
 * api/app/Http/Middleware/Authenticate.php) to determine if the user making the
 * request has sent up a proper cookie
 */

class AuthServiceProvider extends ServiceProvider
{
    /*
     * This function looks for a cookie called api_token that should be set if the user
     * has registered/logged in successfully and retrieves the user that the api token
     * belongs to
     */
    public function boot()
    {
        $this->app['auth']->viaRequest('api', function ($request) {
            // Look for api_token cookie
            $api_token = $request->cookie('api_token');
            if ($api_token) {
                // Look for user with given api token
                $user_id = app('db')->table('api_tokens')->where('token', $api_token)->value('user_id');
                if ($user_id) {
                    return $user_id;
                }
            }
        });
    }
}

<?php

namespace App\Http\Middleware;
use Closure;
use Illuminate\Contracts\Auth\Factory as Auth;

/*
 * file - api/app/Http/Middleware/Authenticate.php
 * author - Patrick Richeal
 * 
 * Authentication middleware, used by any route that should require a user to
 * identify themselves
 */

class Authenticate
{
    protected $auth;

    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    /*
     * Function called when a request needs to go through this middleware, uses
     * the auth service (defined in api/app/Providers/AuthServiceProvider.php) to
     * determine if the user has the proper credentials to continue and returns an
     * error response if they don't
     */
    public function handle($request, Closure $next, $guard = null)
    {
        if ($this->auth->guard($guard)->guest()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}

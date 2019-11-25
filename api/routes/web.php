<?php

/*
 * file - api/routes/web.php
 * author - Patrick Richeal
 * 
 * Routes file, this is where I define all the routes of my API and link
 * them to functions in either my UserController or PictureController.
 * Controller files can be found in api/app/Http/Controllers
 */

// ===========================================
// Routes that do not require authentication
// ===========================================

// Endpoint to check username availability
$router->get('/users/username-taken', 'UserController@usernameTaken');

// Endpoint to register
$router->post('/users', 'UserController@register');

// Endpoint to login
$router->post('/users/login', 'UserController@login');

// Endpoint to make a forgot password request
$router->post('/users/forgot-password', 'UserController@forgotPassword');

// Endpoint to update a users password
$router->put('/users/password', 'UserController@updatePassword');

// Endpoint to verify your email
$router->post('/users/verify-email', 'UserController@verifyEmail');

// Endpoint to get a paginated list of pictures
$router->get('/pictures/', 'PictureController@get');

// Endpoint to get a single picture
$router->get('/pictures/{pretty_id}', 'PictureController@get');



// ===========================================
// Routes that require authentication
// ===========================================

// All these endpoints go through the middleware auth, ensure that the cookie
// given by either register/login endpoint is sent up
$router->group(['middleware' => 'auth'], function ($router) {

    // Endpoint to upload a picture
    $router->post('/pictures', 'PictureController@upload');

    // Endpoint to comment on a picture
    $router->post('/pictures/{pretty_id}/comments', 'PictureController@comment');

    // Endpoint to delete a comment
    $router->delete('/pictures/{pretty_id}/comments/{comment_id}', 'PictureController@deleteComment');
});
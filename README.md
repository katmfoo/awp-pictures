# Overview

My project is broken into two different code bases, a PHP api created with the [Lumen framework](https://lumen.laravel.com/) and a static client website created with [React](https://reactjs.org/) and [Semantic UI](https://semantic-ui.com/).

## API

The api could almost be seen as a totally functioning version of the project, just without an interface. It provides all the real functionality to the client, the client is just making HTTP requests to the api whenever it wants to do something. The api knows absolutely nothing about the client and could be easily reused for a mobile app, for example.

The api uses a token based authentication system. Upon registering or logging in, the user is given a unique api token that is sent up with subsequent requests. This token allows the api to identify the user making the request and determine who is uploading a picture or trying to delete a comment (and whether or not they are allowed to). The api validates against any bad data and authorizes any actions being performed by the user.

## Client

The client uses React for templating and components and Semantic UI for stylized components like buttons, inputs, etc. React allowed me to easily put together pages as javascript classes that contained everything needed to show the page, including the pages state and how that state is rendered on the pages template.</p>

The client is eventually built for production which results in a completely static collection of html, javascript, and css. This static website is simply served to the user, and all http requests to the api are made locally via ajax on the users machine.


# What files to look at

The frameworks I used create a lot of files that you really don't need to look at. I recommend looking over the following files in the following order, the code should document itself well enough.

## Database

* [`db/awp-pictures.sql`](https://github.com/pricheal/awp-pictures/blob/master/db/awp-pictures.sql): has all of the sql to create the structure of the database + comments on the structure itself

## API

* [`api/bootstrap/app.php`](https://github.com/pricheal/awp-pictures/blob/master/api/bootstrap/app.php): bootstraps the api framework, nothing super interesting
* [`api/app/Http/Middleware/Authenticate.php`](https://github.com/pricheal/awp-pictures/blob/master/api/app/Http/Middleware/Authenticate.php): middleware to authenticate user requests
* [`api/app/Providers/AuthServiceProvider.php`](https://github.com/pricheal/awp-pictures/blob/master/api/app/Providers/AuthServiceProvider.php): service used by auth middleware
* [`api/routes/web.php`](https://github.com/pricheal/awp-pictures/blob/master/api/routes/web.php): defines the routes of all the endpoints in the api
* [`api/app/Http/Controllers/UserController.php`](https://github.com/pricheal/awp-pictures/blob/master/api/app/Http/Controllers/UserController.php): controller that holds all the functionality for users
* [`api/app/Http/Controllers/PictureController.php`](https://github.com/pricheal/awp-pictures/blob/master/api/app/Http/Controllers/PictureController.php): controller that holds all the functionality for pictures
* [`api/app/Libraries/Helpers.php`](https://github.com/pricheal/awp-pictures/blob/master/api/app/Libraries/Helpers.php): collection of random helper functions

## Client
* [`client/src/index.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/index.js): initial javascript entry point of react app
* [`client/src/App.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/App.js): app component, holds all other components and displays with router
* [`client/src/App.css`](https://github.com/pricheal/awp-pictures/blob/master/client/src/App.css): global css (not much, most comes from Semantic UI)
* [`client/src/Util.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/Util.js): util functions used by a lot of the page components
* [`client/src/pages/LoginPage.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/pages/LoginPage.js): the login page
* [`client/src/pages/CreateAccountPage.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/pages/CreateAccountPage.js): the create account page
* [`client/src/pages/VerifyEmailPage.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/pages/VerifyEmailPage.js): the verify email page, sent here upon clicking the link in the 'verify email' email
* [`client/src/pages/ForgotPasswordPage.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/pages/ForgotPasswordPage.js): the forgot password page, allows you to create a forgot password request which sends the email
* [`client/src/pages/ChangePasswordPage.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/pages/ChangePasswordPage.js): the change password page, sent here upon clicking the link in the 'forgot password' email or when you click change password from the user dropdown menu
* [`client/src/pages/BrowsePage.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/pages/BrowsePage.js): the browse page, main page to look at paginated/sorted list of uploaded pictures
* [`client/src/pages/PostPicturePage.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/pages/PostPicturePage.js): the post picture page
* [`client/src/pages/PicturePage.js`](https://github.com/pricheal/awp-pictures/blob/master/client/src/pages/PicturePage.js): the picture page, detail page for a single picture

# Elvis setup info

You don't need to read this part Professor Provine, just here for my reference.

## API Setup
1. `cd awp-pictures/api/`
2. `composer install`
3. `chmod 755 -R ../../awp-pictures`
4. `chmod 777 -R storage`
5. `cd ../`
6. `mysql -u richealp7 -p richealp7 < db/awp-pictures.sql`

## Client setup
1. `cd awp-pictures/client/`
2. `npm install`
3. `npm run build`
4. Add the following to a `.htaccess` file inside `awp-pictures/client/build/`
```
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /~richealp7/awp/awp-pictures/client/build/index.html [L]
</IfModule>
```
5. `chmod 755 -R ../../awp-pictures`

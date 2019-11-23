# awp-pictures
Picture website project for advanced web programming class

### API Setup
1. `cd awp-pictures/api/`
2. `composer install`
3. `chmod 755 -R ../../awp-pictures`
4. `chmod 777 -R storage`
5. `cd ../`
6. `mysql -u richealp7 -p richealp7 < db/awp-pictures.sql`

### Client setup
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

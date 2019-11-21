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
4. `chmod 755 -R ../../awp-pictures`

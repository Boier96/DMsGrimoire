make sure the following are installed

- MySQL 8+
- Apache
- PHP

setup.bat: "mysql -u root -p dm_grimoire < "C:\Users\lumi.wegerif\Documents\GitHub\DMsGrimoire\backend\data\database\dm_grimoire.sql""
set this to whatver your path is for the .sql file.

Configure Apache:

at the bottom of httpd.conf:
"LoadModule php_module "C:/php/php8apache2_4.dll"
<FilesMatch \.php$>
    SetHandler application/x-httpd-php
</FilesMatch>
PHPIniDir "C:/php""

then find "Define SRVROOT "C:/apache/Apache24"", and make sure it actually points to the correct place.x

make sure to find "Include conf/extra/httpd-vhosts.conf" and "LoadModule rewrite_module modules/mod_rewrite.so" and uncomment both of them.

and then at the bottom of the httpd-vhosts.conf (you can find under extras next to the httpd.conf file):
"<VirtualHost *:80>
    ServerName dm-grimoire.local
    DocumentRoot "C:/path/to/DMsGrimoire/backend"
    <Directory "C:/path/to/DMsGrimoire/backend">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>"

next, go to "C:\Windows\System32\drivers\etc\hosts" and add "127.0.0.1   dm-grimoire.local".

Run in bash at Apache24/bin "httpd.exe -t", and if it says "Ok" then run httpd.exe -k install

Now, you can start apache (httpd.exe -k start), and if you go to | http://dm-grimoire.local:port you put it on | you should see the index of the app.

OBS IF YOU ARE UNABLE TO HAVE APACHE TAKE PORT 80 CHANGE IN HTTPD.CONF FROM "Listen 80" TO WHATEVER NEW PORT,
you must also then change in the httpd-vhosts.conf file from 80 to whatver. Finally, and most IMPORTANTLY the url in vite.config.js -
can not just be "http://dm-grimoire.local" if you are not on port 80, you must explicitely give tell it what port eg http://dm-grimoire.local:8080
I dont know why my 80 port is busy, but it's probably the fault of academia _---_

In your 'php.ini', make sure the following lines are uncommented:
extension=mbstring
extension=mysqli
extension=pdo_mysql

also, set "extension_dir = "ext""

Make sure MySQL is in your system path, since the setup.bat file won't work otherwise.

From the project root, run:
setup.bat (backend\data\database\setup.bat)

When prompted, enter your MySQL username and password.

Run the following in MySQL:
"CREATE USER 'dm_user'@'localhost' IDENTIFIED BY 'abcd1234';
GRANT ALL PRIVILEGES ON dm_grimoire.* TO 'dm_user'@'localhost';
FLUSH PRIVILEGES;"

now you should be all good... hopefully -__-

if you want to login as admin, the password is... admin123
make sure the following are installed

- MySQL 8+
- Apache
- PHP

Configure Apache:

at the bottom of httpd.conf:
"LoadModule php_module "C:/php/php8apache2_4.dll"
<FilesMatch \.php$>
    SetHandler application/x-httpd-php
</FilesMatch>
PHPIniDir "C:/php""

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

Now, you can start apache, and if you go to http://dm-grimoire.local you should see the index of the app.

In your 'php.ini', make sure the following lines are uncommented:
extension=mbstring
extension=mysqli
extension=pdo_mysql

also, set "extension_dir = "ext""

Make sure MySQL is in your system path, since the setup.bat file won't work otherwise.

From the project root, run:
setup.bat

When prompted, enter your MySQL username and password.

Run the following in MySQL:
"CREATE USER 'dm_user'@'localhost' IDENTIFIED BY 'abcd1234';
GRANT ALL PRIVILEGES ON dm_grimoire.* TO 'dm_user'@'localhost';
FLUSH PRIVILEGES;"

now you should be all good... hopefully -__-

if you want to login as admin, the password is... admin123
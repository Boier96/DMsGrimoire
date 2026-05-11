@echo off
echo Setting up dm_grimoire database...

mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dm_grimoire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p dm_grimoire < "C:\Users\lumi.wegerif\Documents\GitHub\DMsGrimoire\backend\data\database\dm_grimoire.sql"

echo.
echo Setup complete!
pause
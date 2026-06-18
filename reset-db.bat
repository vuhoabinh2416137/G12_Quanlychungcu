@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [1/2] Dang xoa rác va tao lai bang...
cmd.exe /c "docker exec -i bluemoon mysql -uroot -proot < database\schema.sql"

echo [2/2] Dang nap du lieu mau va cap nhat so xe, dien, nuoc...
cmd.exe /c "docker exec -i bluemoon mysql -uroot -proot < database\seed.sql"

echo ========================================================
echo HOAN TAT DON SACH DATABASE!
echo Vui long chay lai file run-all.bat de khoi dong lai he thong.
echo ========================================================
pause

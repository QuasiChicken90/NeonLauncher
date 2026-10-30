@echo off
setlocal
cd /d "%~dp0"

IF EXIST "Library\Config\configuration_setup.json" del /F /Q "Library\Config\configuration_setup.json"
IF EXIST "Library\Config\configuration.json" del /F /Q "Library\Config\configuration.json"
IF EXIST "Library\Config\account.json" del /F /Q "Library\Config\account.json"
IF EXIST "release" rmdir /S /Q "release"

call npm run pack

xcopy "Library" "release\win-unpacked\Library" /E /I /Y

copy /Y "launcher_update.bat" "release\win-unpacked\launcher_update.bat"

IF EXIST "release\update.zip" del /F /Q "release\update.zip"

powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path 'release\win-unpacked\*' -DestinationPath 'release\update.zip' -CompressionLevel Optimal"

pause
endlocal
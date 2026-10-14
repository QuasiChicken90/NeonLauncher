@echo off
title NeonLauncher Updating...

taskkill /F /IM NeonLauncher.exe 2>nul

taskkill /F /IM Backend.exe 2>nul

timeout /t 2 /nobreak >nul

if exist "Library\Config\configuration_setup.json" del /F /Q "Library\Config\configuration_setup.json"

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Expand-Archive -Path 'update.zip' -DestinationPath '.' -Force; Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Update complete! Please open NeonLauncher.exe to continue.', 'Update Installed', 'OK', 'Information')"

exit

@echo off
rem Resolvo: doble clic para quitar el inicio automatico al encender el equipo.
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0cli\autostart.ps1" -Action off
echo.
pause

@echo off
rem Resolvo: doble clic para que Resolvo arranque solo al encender el equipo (al iniciar sesion).
rem No requiere permisos de administrador. Para quitarlo: desactivar-inicio-automatico.cmd
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0cli\autostart.ps1" -Action on
set "CODE=%errorlevel%"
echo.
pause
exit /b %CODE%

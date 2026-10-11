@echo off
rem Resolvo: resolvo ^<comando^>   (resolvo help para ver todos)
rem Usa Node si esta instalado; si no, solo hace falta Docker Desktop.
setlocal
cd /d "%~dp0"
set "NODE_IMAGE=node:24.13.1-alpine"
where node >nul 2>nul
if %errorlevel%==0 (
  node cli\resolvo.mjs %*
  exit /b %errorlevel%
)
set "CMD=%~1"
if "%CMD%"=="" set "CMD=help"
if /i "%CMD%"=="install" goto :configure
if /i "%CMD%"=="config" goto :configure
if /i "%CMD%"=="start" (docker compose up -d db app & exit /b)
if /i "%CMD%"=="stop" (docker compose stop & exit /b)
if /i "%CMD%"=="restart" (docker compose restart app & exit /b)
if /i "%CMD%"=="status" (docker compose ps & exit /b)
if /i "%CMD%"=="logs" (docker compose logs -f --tail 200 app & exit /b)
if /i "%CMD%"=="update" goto :update
echo Comandos sin Node: install, config, start, stop, restart, status, logs, update
echo Para backup, restore y dev instala Node 18+ (https://nodejs.org).
exit /b
:configure
docker run --rm -it -v "%cd%:/work" -w /work "%NODE_IMAGE%" node cli/resolvo.mjs %CMD% --env-only || exit /b 1
findstr /b /c:"RESOLVO_BUILD=true" .env >nul && (docker compose build app) || (docker compose pull app || docker compose build app)
docker compose up -d db app
exit /b
:update
git pull --ff-only 2>nul
docker compose pull app || docker compose build app
docker compose up -d db app
exit /b

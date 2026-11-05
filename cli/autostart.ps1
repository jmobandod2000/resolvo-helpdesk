# Resolvo: inicio automático con Windows.
# Uso: powershell -ExecutionPolicy Bypass -File cli\autostart.ps1 -Action on|off|status|run
#   on      Docker Desktop arranca al iniciar sesión y Resolvo se levanta solo (sin permisos de administrador)
#   off     Quita el inicio automático de Resolvo (Docker Desktop queda como esté)
#   status  Muestra si está activo y las últimas líneas del registro
#   run     Lo que se ejecuta al iniciar sesión: espera a Docker, levanta Resolvo y comprueba que responda

param(
  [ValidateSet('on', 'off', 'status', 'run')]
  [string]$Action = 'status',
  [switch]$Quiet
)

# Continue: en PowerShell 5.1, con Stop el progreso que docker escribe en stderr se vuelve error
$ErrorActionPreference = 'Continue'
$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $Root '.env'
$LogDir = Join-Path $Root 'logs'
$LogFile = Join-Path $LogDir 'autostart.log'
$RunKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
$TaskName = 'Resolvo'
$DockerTimeoutSec = 600
$HealthTimeoutSec = 300

$lang = if ($env:RESOLVO_LANG) { $env:RESOLVO_LANG } else { (Get-UICulture).Name }
$en = $lang -like 'en*'
function T([string]$es, [string]$english) { if ($en) { $english } else { $es } }

function Say([string]$text, [string]$color = 'Gray') { if (-not $Quiet) { Write-Host $text -ForegroundColor $color } }
function Ok([string]$text) { Say "  [OK] $text" 'Green' }
function Warn([string]$text) { Say "  [!]  $text" 'Yellow' }

function Log([string]$text) {
  if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
  $line = '{0:yyyy-MM-dd HH:mm:ss}  {1}' -f (Get-Date), $text
  Add-Content -Path $LogFile -Value $line -Encoding UTF8
  if ((Get-Item $LogFile).Length -gt 512KB) {
    $tail = Get-Content $LogFile -Tail 400
    Set-Content -Path $LogFile -Value $tail -Encoding UTF8
  }
}

function Read-Env {
  $values = @{}
  if (Test-Path $EnvFile) {
    foreach ($line in Get-Content $EnvFile) {
      if ($line -match '^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$') {
        $values[$Matches[1]] = $Matches[2] -replace "^'(.*)'$", '$1' -replace '^"(.*)"$', '$1'
      }
    }
  }
  $values
}

function Find-DockerDesktop {
  $candidates = @(
    (Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\Docker\Docker\Docker Desktop.exe')
  )
  foreach ($path in $candidates) { if (Test-Path $path) { return $path } }
  $null
}

function Test-DockerUp {
  $null = cmd /c 'docker info >nul 2>&1'
  $LASTEXITCODE -eq 0
}

function Get-LaunchCommand {
  $script = Join-Path $PSScriptRoot 'autostart.ps1'
  "powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`" -Action run -Quiet"
}

# Docker Desktop guarda "AutoStart" en settings-store.json (versiones nuevas) o settings.json (anteriores).
# Se activan las dos piezas: la opción de Docker y su entrada de inicio de Windows.
function Enable-DockerAutoStart([string]$exe) {
  foreach ($name in 'settings-store.json', 'settings.json') {
    $file = Join-Path $env:APPDATA "Docker\$name"
    if (-not (Test-Path $file)) { continue }
    $raw = Get-Content $file -Raw
    if ($raw -match '"AutoStart"\s*:\s*true') { continue }
    if ($raw -match '"AutoStart"\s*:\s*false') {
      $raw = $raw -replace '"AutoStart"\s*:\s*false', '"AutoStart": true'
    } else {
      $raw = $raw -replace '^\s*\{', "{`n  `"AutoStart`": true,"
    }
    [IO.File]::WriteAllText($file, $raw, (New-Object Text.UTF8Encoding $false))
  }
  $current = (Get-ItemProperty -Path $RunKey -Name 'Docker Desktop' -ErrorAction SilentlyContinue).'Docker Desktop'
  if (-not $current) { Set-ItemProperty -Path $RunKey -Name 'Docker Desktop' -Value $exe }
}

function Test-DockerAutoStart {
  $value = (Get-ItemProperty -Path $RunKey -Name 'Docker Desktop' -ErrorAction SilentlyContinue).'Docker Desktop'
  [bool]$value
}

function Invoke-On {
  Say ''
  Say (T 'Resolvo · activar inicio automático' 'Resolvo · enable start with Windows') 'Cyan'
  Say ''
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Warn (T 'No se encontró Docker. Instala Docker Desktop: https://docs.docker.com/desktop/' 'Docker was not found. Install Docker Desktop: https://docs.docker.com/desktop/')
    exit 1
  }
  if (-not (Test-Path $EnvFile)) {
    Warn (T 'Resolvo aún no está instalado en esta carpeta. Ejecuta primero: resolvo install' 'Resolvo is not installed in this folder yet. Run first: resolvo install')
    exit 1
  }
  $exe = Find-DockerDesktop
  if ($exe) {
    Enable-DockerAutoStart $exe
    Ok (T 'Docker Desktop se abrirá al iniciar sesión' 'Docker Desktop will open at sign-in')
  } else {
    Warn (T 'No se encontró Docker Desktop: asegúrate de que el servicio de Docker arranque con Windows' 'Docker Desktop not found: make sure the Docker service starts with Windows')
  }
  Set-ItemProperty -Path $RunKey -Name $TaskName -Value (Get-LaunchCommand) -ErrorAction Stop
  Ok (T 'Resolvo se levantará solo al iniciar sesión' 'Resolvo will start by itself at sign-in')
  Log 'Inicio automático activado'

  $cfg = Read-Env
  $port = if ($cfg.RESOLVO_PORT) { $cfg.RESOLVO_PORT } else { '8080' }
  $url = if ($cfg.APP_URL) { $cfg.APP_URL } else { "http://localhost:$port" }
  Say ''
  Say (T "  Dirección: $url" "  Address: $url")
  Say (T "  Registro:  $LogFile" "  Log:      $LogFile")
  Say (T '  Requiere que alguien inicie sesión en Windows (Docker Desktop no corre sin sesión).' '  Someone must sign in to Windows (Docker Desktop does not run without a session).')
  Say (T '  Para quitarlo: desactivar-inicio-automatico.cmd  o  resolvo autostart off' '  To remove it: desactivar-inicio-automatico.cmd  or  resolvo autostart off')
  Say ''
  Say (T 'Comprobando que Resolvo esté arriba ahora...' 'Checking that Resolvo is up now...')
  $code = Invoke-Run
  if ($code -eq 0) { Ok (T 'Resolvo responde' 'Resolvo is responding') } else { Warn (T "Resolvo no respondió todavía; revisa $LogFile" "Resolvo did not respond yet; check $LogFile") }
  Say ''
}

function Invoke-Off {
  Remove-ItemProperty -Path $RunKey -Name $TaskName -ErrorAction SilentlyContinue
  Log 'Inicio automático desactivado'
  Say ''
  Ok (T 'Resolvo ya no se levanta solo al iniciar sesión. Docker Desktop queda como estaba.' 'Resolvo no longer starts at sign-in. Docker Desktop is left as it was.')
  Say (T '  Los contenedores conservan "restart: unless-stopped": si no los detienes con "resolvo stop", Docker los vuelve a levantar.' '  Containers keep "restart: unless-stopped": unless you run "resolvo stop", Docker brings them back.')
  Say ''
}

function Invoke-Status {
  $entry = (Get-ItemProperty -Path $RunKey -Name $TaskName -ErrorAction SilentlyContinue).$TaskName
  Say ''
  if ($entry) {
    Ok (T 'Inicio automático de Resolvo: activo' 'Resolvo start with Windows: on')
    if ($entry -notlike "*$PSScriptRoot*") { Warn (T "Apunta a otra carpeta: $entry" "Points to another folder: $entry") }
  } else {
    Warn (T 'Inicio automático de Resolvo: inactivo' 'Resolvo start with Windows: off')
  }
  if (Test-DockerAutoStart) { Ok (T 'Docker Desktop: abre al iniciar sesión' 'Docker Desktop: opens at sign-in') }
  else { Warn (T 'Docker Desktop: no abre al iniciar sesión' 'Docker Desktop: does not open at sign-in') }
  if (Test-Path $LogFile) {
    Say ''
    Say (T 'Últimas líneas del registro:' 'Last log lines:')
    Get-Content $LogFile -Tail 8 | ForEach-Object { Say "  $_" }
  }
  Say ''
}

function Wait-Health([string]$port) {
  $deadline = (Get-Date).AddSeconds($HealthTimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/health" -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -eq 200) { return $response.Content }
    } catch { }
    Start-Sleep -Seconds 3
  }
  $null
}

function Invoke-Run {
  Set-Location $Root
  if (-not (Test-Path $EnvFile)) { Log 'ERROR: falta .env (ejecuta resolvo install)'; return 1 }

  if (-not (Test-DockerUp)) {
    Log 'Esperando a Docker...'
    $exe = Find-DockerDesktop
    if ($exe -and -not (Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue)) {
      Start-Process -FilePath $exe
      Log 'Docker Desktop iniciado'
    }
    $deadline = (Get-Date).AddSeconds($DockerTimeoutSec)
    while (-not (Test-DockerUp)) {
      if ((Get-Date) -gt $deadline) { Log "ERROR: Docker no respondió en $DockerTimeoutSec s"; return 1 }
      Start-Sleep -Seconds 5
    }
  }
  Log 'Docker listo'

  $output = cmd /c 'docker compose up -d --no-build db app 2>&1' | Out-String
  if ($LASTEXITCODE -ne 0) { Log "ERROR: docker compose up falló: $($output.Trim())"; return 1 }

  $cfg = Read-Env
  $port = if ($cfg.RESOLVO_PORT) { $cfg.RESOLVO_PORT } else { '8080' }
  $health = Wait-Health $port
  if ($health) { Log "Resolvo listo en el puerto $port $health"; return 0 }
  Log "ERROR: Resolvo no respondió en el puerto $port tras $HealthTimeoutSec s (revisa: resolvo logs)"
  1
}

switch ($Action) {
  'on' { Invoke-On }
  'off' { Invoke-Off }
  'status' { Invoke-Status }
  'run' { exit (Invoke-Run) }
}

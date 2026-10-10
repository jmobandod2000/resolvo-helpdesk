param(
  [string]$BaseUrl
)

$ErrorActionPreference = 'Stop'
$envFile = Join-Path $PSScriptRoot '..\.env'
$vars = @{}
Get-Content $envFile | Where-Object { $_ -match '^\s*([A-Z_]+)=(.*)$' } | ForEach-Object {
  $vars[$Matches[1]] = $Matches[2].Trim('"')
}
if (-not $BaseUrl) { $BaseUrl = "http://localhost:$($vars['PORT'])/api" }

$script:failures = 0
$script:checks = 0

function Invoke-Api($method, $path, $body = $null, $token = $null) {
  $headers = @{ 'x-lang' = 'es' }
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  $params = @{ Method = $method; Uri = "$BaseUrl/$path"; Headers = $headers; ContentType = 'application/json; charset=utf-8' }
  if ($null -ne $body) { $params['Body'] = [Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Depth 6)) }
  try { Invoke-RestMethod @params }
  catch {
    $status = $_.Exception.Response.StatusCode.value__
    [pscustomobject]@{ error = $status; detail = $_.ErrorDetails.Message }
  }
}

function Check($label, [bool]$condition, $detail = '') {
  $script:checks++
  if ($condition) { Write-Host "OK    $label $detail" -ForegroundColor Green }
  else { $script:failures++; Write-Host "FALLA $label $detail" -ForegroundColor Red }
}

Write-Host "Prueba de humo contra $BaseUrl`n"

$login = Invoke-Api 'POST' 'auth/login' @{ email = $vars['LOGIN_EMAIL']; password = $vars['LOGIN_PASSWORD'] }
$token = $login.jwt
Check 'Login del administrador' ([bool]$token)

$badLogin = Invoke-Api 'POST' 'auth/login' @{ email = $vars['LOGIN_EMAIL']; password = 'Incorrecta1' }
Check 'Login con clave errada rechazado' ($badLogin.error -eq 401) "HTTP $($badLogin.error)"

$noAuth = Invoke-Api 'GET' 'tickets'
Check 'Tickets sin token rechazado' ($noAuth.error -eq 401) "HTTP $($noAuth.error)"

$list = Invoke-Api 'GET' 'tickets?limit=5' $null $token
Check 'Listado de tickets' ($null -ne $list.total) "total=$($list.total)"

$open = Invoke-Api 'GET' 'tickets?onlyOpen=true&limit=50' $null $token
Check 'Filtro de abiertos' ($null -ne $open.total) "abiertos=$($open.total)"

$catalogs = Invoke-Api 'GET' 'drop-downs/catalogs' $null $token
Check 'Catalogos' ($catalogs.statuses.Count -eq 7 -and $catalogs.priorities.Count -eq 4)

$sites = @(Invoke-Api 'GET' 'sites' $null $token | ForEach-Object { $_ })
$categories = @(Invoke-Api 'GET' 'categories' $null $token | ForEach-Object { $_ })
Check 'Sedes y categorias' ($null -eq $sites[0].error -and $null -eq $categories[0].error) "sedes=$($sites.Count) categorias=$($categories.Count)"
$siteId = ($sites | Where-Object { $_.isActive } | Select-Object -First 1).id
$categoryId = ($categories | Where-Object { $_.isActive } | Select-Object -First 1).id

$profile = Invoke-Api 'GET' 'organization/public'
Check 'Perfil publico de la empresa' ($null -ne $profile.configured) "empresa=$($profile.name) portal=$($profile.portalEnabled)"

$payload = @{
  title = 'Prueba de humo del sistema de tickets'
  description = 'Ticket creado por el script de prueba'
  requesterName = 'QA'
  productCodes = @('999999')
}
if ($siteId) { $payload['siteId'] = $siteId }
if ($categoryId) { $payload['categoryId'] = $categoryId }
$new = Invoke-Api 'POST' 'tickets' $payload $token
Check 'Crear ticket' ($new.code -match '^TK-\d{5}$') "$($new.code) estado=$($new.status)"

$invalid = Invoke-Api 'POST' 'tickets' @{ title = 'x'; description = 'y'; requesterName = 'QA'; extra = 1 } $token
Check 'Validacion de datos' ($invalid.error -eq 400) "HTTP $($invalid.error)"

$closeEarly = Invoke-Api 'PATCH' "tickets/$($new.id)/status" @{ status = 'CLOSED' } $token
Check 'Cerrar sin causa ni comentario rechazado' ($closeEarly.error -eq 400) "HTTP $($closeEarly.error)"

$internal = Invoke-Api 'POST' "tickets/$($new.id)/notes" @{ note = 'Nota interna de la prueba' } $token
Check 'Nota interna' ($internal.type -eq 'NOTE' -and -not $internal.isPublic)

$public = Invoke-Api 'POST' "tickets/$($new.id)/notes" @{ note = 'Respuesta publica de la prueba'; isPublic = $true } $token
Check 'Nota publica' ($public.isPublic -eq $true)

$link = Invoke-Api 'POST' "tickets/$($new.id)/public-link" @{} $token
$link2 = Invoke-Api 'POST' "tickets/$($new.id)/public-link" @{} $token
Check 'Enlace de seguimiento estable' ($link.token.Length -eq 43 -and $link.token -eq $link2.token)

$resolved = Invoke-Api 'PATCH' "tickets/$($new.id)/status" @{ status = 'RESOLVED'; note = 'Diagnostico listo' } $token
Check 'Resolver' ([bool]$resolved.resolvedAt)

$closed = Invoke-Api 'PATCH' "tickets/$($new.id)/status" @{ status = 'CLOSED'; rootCause = 'NO_ISSUE'; closureComment = 'Prueba cerrada' } $token
Check 'Cerrar con causa y comentario' ($closed.status -eq 'CLOSED' -and [bool]$closed.closedAt)

$reopened = Invoke-Api 'PATCH' "tickets/$($new.id)/status" @{ status = 'IN_ANALYSIS'; note = 'Reapertura de prueba' } $token
Check 'Reabrir limpia fechas' ($reopened.status -eq 'IN_ANALYSIS' -and -not $reopened.resolvedAt -and -not $reopened.closedAt)

$detail = Invoke-Api 'GET' "tickets/$($new.code)" $null $token
Check 'Detalle por codigo con historial' ($detail.Events.Count -ge 6) "eventos=$($detail.Events.Count)"

$deleted = Invoke-Api 'DELETE' "tickets/$($new.id)" $null $token
Check 'Borrado logico' ($deleted.isDeleted -eq $true)

$metrics = Invoke-Api 'GET' 'metrics/summary' $null $token
Check 'Metricas' ($null -ne $metrics.totals.total) "total=$($metrics.totals.total) tasa=$($metrics.totals.resolutionRate)%"

$from = (Get-Date).AddDays(-90).ToString('yyyy-MM-dd')
$to = (Get-Date).ToString('yyyy-MM-dd')
$report = Invoke-Api 'GET' "reports?from=$from&to=$to&groupBy=month&timeZone=UTC" $null $token
Check 'Reporte del periodo' ($null -ne $report.totals.received) "recibidos=$($report.totals.received) periodos=$($report.periods.Count)"

$notifications = Invoke-Api 'GET' 'notifications' $null $token
Check 'Notificaciones' ($null -ne $notifications.unread) "sin leer=$($notifications.unread)"

$portal = Invoke-Api 'GET' 'portal/config'
Check 'Configuracion del portal' ($null -ne $portal.enabled) "activo=$($portal.enabled)"

if ($portal.enabled) {
  $before = $notifications.unread
  $created = Invoke-Api 'POST' 'portal/tickets' @{
    title = 'Prueba de humo del portal'
    description = 'Solicitud creada por el script de prueba'
    requesterName = 'QA Portal'
    elapsedMs = 9000
  }
  Check 'Solicitud desde el portal' ($created.token.Length -eq 43) "$($created.code)"

  $bot = Invoke-Api 'POST' 'portal/tickets' @{ title = 'Bot'; description = 'Solicitud de un bot'; requesterName = 'Bot'; elapsedMs = 9000; website = 'spam' }
  Check 'Campo trampa rechaza bots' ($bot.error -eq 400 -or $bot.error -eq 429) "HTTP $($bot.error)"

  $portalTicket = Invoke-Api 'GET' "tickets/$($created.code)" $null $token
  $null = Invoke-Api 'POST' "tickets/$($portalTicket.id)/notes" @{ note = 'Nota interna secreta' } $token
  $null = Invoke-Api 'POST' "tickets/$($portalTicket.id)/notes" @{ note = 'Pregunta para el solicitante'; isPublic = $true } $token
  $null = Invoke-Api 'PATCH' "tickets/$($portalTicket.id)/status" @{ status = 'WAITING_INFO' } $token
  $view = Invoke-Api 'GET' "portal/tickets/$($created.token)"
  $leaked = @($view.events | Where-Object { $_.message -eq 'Nota interna secreta' }).Count
  Check 'El portal oculta notas internas' ($leaked -eq 0 -and @($view.events | Where-Object { $_.message -eq 'Pregunta para el solicitante' }).Count -eq 1)

  $reply = Invoke-Api 'POST' "portal/tickets/$($created.token)/replies" @{ message = 'Respuesta del solicitante' }
  Check 'Respuesta del solicitante reabre el analisis' ($reply.status -eq 'IN_ANALYSIS')

  $after = (Invoke-Api 'GET' 'notifications' $null $token).unread
  Check 'Notificaciones del portal' ($after -ge $before + 1) "antes=$before despues=$after"

  $null = Invoke-Api 'DELETE' "tickets/$($portalTicket.id)" $null $token
}

Write-Host "`n$($script:checks - $script:failures) de $($script:checks) comprobaciones OK"
if ($script:failures -gt 0) { exit 1 }

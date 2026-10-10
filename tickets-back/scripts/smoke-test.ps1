$ErrorActionPreference = 'Stop'
$envFile = Join-Path $PSScriptRoot '..\.env'
$vars = @{}
Get-Content $envFile | Where-Object { $_ -match '^\s*([A-Z_]+)=(.*)$' } | ForEach-Object {
  $vars[$Matches[1]] = $Matches[2].Trim('"')
}
$base = "http://localhost:$($vars['PORT'])/api"

function Invoke-Api($method, $path, $body = $null, $token = $null) {
  $headers = @{}
  if ($token) { $headers['Authorization'] = "Bearer $token" }
  $params = @{ Method = $method; Uri = "$base/$path"; Headers = $headers; ContentType = 'application/json' }
  if ($body) { $params['Body'] = ($body | ConvertTo-Json -Depth 6) }
  try { Invoke-RestMethod @params }
  catch {
    $status = $_.Exception.Response.StatusCode.value__
    [pscustomobject]@{ error = $status; detail = $_.ErrorDetails.Message }
  }
}

$login = Invoke-Api 'POST' 'auth/login' @{ email = $vars['LOGIN_EMAIL']; password = $vars['LOGIN_PASSWORD'] }
$token = $login.jwt
"1. Login: usuario=$($login.name) rol=$($login.roles) token=$([bool]$token)"

$badLogin = Invoke-Api 'POST' 'auth/login' @{ email = $vars['LOGIN_EMAIL']; password = 'Incorrecta1' }
"2. Login con clave errada: HTTP $($badLogin.error)"

$noAuth = Invoke-Api 'GET' 'tickets'
"3. Tickets sin token: HTTP $($noAuth.error)"

$list = Invoke-Api 'GET' 'tickets?limit=5' $null $token
"4. Listado: total=$($list.total) primeros=" + (($list.data | ForEach-Object { $_.code }) -join ', ')

$open = Invoke-Api 'GET' 'tickets?onlyOpen=true&limit=50' $null $token
"5. Abiertos: $($open.total)"

$search = Invoke-Api 'GET' 'tickets?search=000885' $null $token
"6. Busqueda 000885: $($search.total) -> $($search.data[0].code)"

$detail = Invoke-Api 'GET' 'tickets/TK-00007' $null $token
"7. Detalle TK-00007: estado=$($detail.status) eventos=$($detail.Events.Count)"

$new = Invoke-Api 'POST' 'tickets' @{
  title = 'Prueba de humo del sistema de tickets'
  description = 'Ticket creado por el script de prueba'
  requesterName = 'QA'
  company = 'MATURIN'
  category = 'SYSTEM'
  productCodes = @('999999')
} $token
"8. Creado: $($new.code) estado=$($new.status)"

$closeEarly = Invoke-Api 'PATCH' "tickets/$($new.id)/status" @{ status = 'CLOSED' } $token
"9. Cerrar sin comentario ni causa: HTTP $($closeEarly.error)"

$note = Invoke-Api 'POST' "tickets/$($new.id)/notes" @{ note = 'Revisando en base de datos' } $token
"10. Nota agregada: tipo=$($note.type)"

$resolved = Invoke-Api 'PATCH' "tickets/$($new.id)/status" @{ status = 'RESOLVED'; note = 'Diagnostico listo' } $token
"11. Resuelto: resolvedAt=$([bool]$resolved.resolvedAt)"

$closed = Invoke-Api 'PATCH' "tickets/$($new.id)/status" @{ status = 'CLOSED'; rootCause = 'NO_ISSUE'; closureComment = 'Prueba cerrada' } $token
"12. Cerrado: estado=$($closed.status) closedAt=$([bool]$closed.closedAt)"

$reopened = Invoke-Api 'PATCH' "tickets/$($new.id)/status" @{ status = 'IN_ANALYSIS'; note = 'Reapertura de prueba' } $token
"13. Reabierto: estado=$($reopened.status) resolvedAt=$($reopened.resolvedAt) closedAt=$($reopened.closedAt)"

$deleted = Invoke-Api 'DELETE' "tickets/$($new.id)" $null $token
"14. Borrado logico: isDeleted=$($deleted.isDeleted)"

$metrics = Invoke-Api 'GET' 'metrics/summary' $null $token
"15. Metricas: total=$($metrics.totals.total) abiertos=$($metrics.totals.open) resueltos=$($metrics.totals.resolved) tasa=$($metrics.totals.resolutionRate)% escalados=$($metrics.totals.escalatedToDev)"
"    Tiempos: 1ra respuesta=$($metrics.times.avgFirstResponseHours)h resolucion=$($metrics.times.avgResolutionHours)h mediana=$($metrics.times.medianResolutionHours)h"
"    Por sede: " + (($metrics.byCompany | ForEach-Object { "$($_.label)=$($_.count)" }) -join ', ')
"    Antiguedad backlog: " + (($metrics.backlogAging | ForEach-Object { "$($_.label)=$($_.count)" }) -join ', ')
"    Semanas: $($metrics.weeklyTrend.Count), top producto: $($metrics.topProducts[0].productCode)"

$catalogs = Invoke-Api 'GET' 'drop-downs/catalogs' $null $token
"16. Catalogos: estados=$($catalogs.statuses.Count) categorias=$($catalogs.categories.Count)"

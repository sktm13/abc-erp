param(
    [string]$LoginUrl = "http://localhost:8080/api/member/login",
    [string]$TargetUrl = "http://localhost:8080/api/member/list",
    [string]$EmployeeNo = "ABC-21-DEV-001",
    [string]$Password = "1111",
    [string]$AccessToken = "",
    [int]$Warmup = 5,
    [int]$Runs = 50,
    [string]$ResultName = "member-list-db-baseline"
)

$ErrorActionPreference = "Stop"

$ResultDir = "scripts/perf/results"

if (!(Test-Path $ResultDir)) {
    New-Item -ItemType Directory -Path $ResultDir | Out-Null
}

$ResultPath = "$ResultDir/$ResultName.csv"

function Get-AccessToken {
    if ($AccessToken -ne "") {
        return $AccessToken
    }

    Write-Host "Login request: $EmployeeNo"

    $LoginBody = @{
        username = $EmployeeNo
        password = $Password
    }

    $LoginResponse = Invoke-RestMethod `
        -Method Post `
        -Uri $LoginUrl `
        -Body $LoginBody `
        -ContentType "application/x-www-form-urlencoded"

    if ($null -eq $LoginResponse.accessToken) {
        throw "accessToken not found in login response."
    }

    return $LoginResponse.accessToken
}

function Request-Target {
    param(
        [string]$Token
    )

    $Headers = @{
        Authorization = "Bearer $Token"
    }

    $Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    $Response = Invoke-WebRequest `
        -Method Get `
        -Uri $TargetUrl `
        -Headers $Headers `
        -UseBasicParsing

    $Stopwatch.Stop()

    $ServerElapsedMs = $Response.Headers["X-Response-Time-Ms"]

    if ($ServerElapsedMs -is [array]) {
        $ServerElapsedMs = $ServerElapsedMs[0]
    }

    return [PSCustomObject]@{
        StatusCode = $Response.StatusCode
        ElapsedMs = [Math]::Round($Stopwatch.Elapsed.TotalMilliseconds, 2)
        ServerElapsedMs = $ServerElapsedMs
    }
}

function Get-P95 {
    param(
        [double[]]$Values
    )

    $Sorted = $Values | Sort-Object
    $Index = [Math]::Ceiling($Sorted.Count * 0.95) - 1

    if ($Index -lt 0) {
        $Index = 0
    }

    return $Sorted[$Index]
}

$Token = Get-AccessToken

Write-Host "Warmup: $Warmup runs"

for ($i = 1; $i -le $Warmup; $i++) {
    Request-Target -Token $Token | Out-Null
}

Write-Host "Start measuring: $Runs runs"
Write-Host "TargetUrl: $TargetUrl"

$Results = @()

for ($i = 1; $i -le $Runs; $i++) {
    $Result = Request-Target -Token $Token

    $Results += [PSCustomObject]@{
        No = $i
        StatusCode = $Result.StatusCode
        ClientElapsedMs = $Result.ElapsedMs
        ServerElapsedMs = $Result.ServerElapsedMs
    }

    Write-Host "$i / $Runs - client=$($Result.ElapsedMs)ms server=$($Result.ServerElapsedMs)ms"
}

$Results | Export-Csv -Path $ResultPath -NoTypeInformation -Encoding UTF8

$ClientValues = $Results.ClientElapsedMs

$ServerValues = $Results |
    Where-Object { $_.ServerElapsedMs -ne $null -and $_.ServerElapsedMs -ne "" } |
    ForEach-Object { [double]$_.ServerElapsedMs }

$ClientAvg = [Math]::Round(($ClientValues | Measure-Object -Average).Average, 2)
$ClientMin = [Math]::Round(($ClientValues | Measure-Object -Minimum).Minimum, 2)
$ClientMax = [Math]::Round(($ClientValues | Measure-Object -Maximum).Maximum, 2)
$ClientP95 = [Math]::Round((Get-P95 -Values $ClientValues), 2)

Write-Host ""
Write-Host "===== Client Result ====="
Write-Host "avg: $ClientAvg ms"
Write-Host "min: $ClientMin ms"
Write-Host "max: $ClientMax ms"
Write-Host "p95: $ClientP95 ms"

if ($ServerValues.Count -gt 0) {
    $ServerAvg = [Math]::Round(($ServerValues | Measure-Object -Average).Average, 2)
    $ServerMin = [Math]::Round(($ServerValues | Measure-Object -Minimum).Minimum, 2)
    $ServerMax = [Math]::Round(($ServerValues | Measure-Object -Maximum).Maximum, 2)
    $ServerP95 = [Math]::Round((Get-P95 -Values $ServerValues), 2)

    Write-Host ""
    Write-Host "===== Server Result ====="
    Write-Host "avg: $ServerAvg ms"
    Write-Host "min: $ServerMin ms"
    Write-Host "max: $ServerMax ms"
    Write-Host "p95: $ServerP95 ms"
}

Write-Host ""
Write-Host "CSV saved: $ResultPath"
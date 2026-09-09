$baseUrl = "http://localhost:8080/api"
$adminPassword = [Environment]::GetEnvironmentVariable("ADMIN_PASSWORD")
if ([string]::IsNullOrWhiteSpace($adminPassword)) {
    Write-Host "Missing required environment variable: ADMIN_PASSWORD" -ForegroundColor Red
    exit 1
}

$body = @{ identifier = "admin"; password = $adminPassword; rememberMe = $false } | ConvertTo-Json
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success!"
} catch {
    Write-Host $_.Exception.Response.StatusCode
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $msg = $reader.ReadToEnd()
    Write-Host $msg
}

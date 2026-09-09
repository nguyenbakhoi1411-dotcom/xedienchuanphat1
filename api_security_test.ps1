$baseUrl = "http://localhost:8080/api"

function Get-RequiredEnv($name) {
    $value = [Environment]::GetEnvironmentVariable($name)
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "Missing required environment variable: $name" -ForegroundColor Red
        exit 1
    }
    return $value
}

function Get-Token($identifier, $password) {
    try {
        $body = @{ identifier = $identifier; password = $password; rememberMe = $false } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
        return $response.accessToken
    } catch {
        Write-Host "LOGIN $identifier -> FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Format-Result($ok) {
    if ($ok) { return "PASS" }
    return "FAIL"
}

function Invoke-HttpCase($label, $method, $uri, $headers, $expectedStatus) {
    try {
        $resp = Invoke-WebRequest -Uri $uri -Method $method -Headers $headers -UseBasicParsing -ErrorAction Stop
        $status = [int]$resp.StatusCode
        $ok = $status -eq $expectedStatus
        $color = if ($ok) { "Green" } else { "Red" }
        Write-Host "$label -> HTTP $status expected $expectedStatus result=$(Format-Result $ok)" -ForegroundColor $color
        return @{ ok = $ok; status = $status; body = $resp.Content }
    } catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $status = [int]$_.Exception.Response.StatusCode
            $ok = $status -eq $expectedStatus
            $color = if ($ok) { "Green" } else { "Red" }
            Write-Host "$label -> HTTP $status expected $expectedStatus result=$(Format-Result $ok)" -ForegroundColor $color
            return @{ ok = $ok; status = $status; body = $null }
        }
        Write-Host "$label -> REQUEST_ERROR expected $expectedStatus result=FAIL message=$($_.Exception.Message)" -ForegroundColor Red
        return @{ ok = $false; status = "REQUEST_ERROR"; body = $null }
    }
}

function Invoke-JsonCase($label, $uri, $headers, $expectedStatus) {
    $result = Invoke-HttpCase $label "Get" $uri $headers $expectedStatus
    if ($result.body) {
        try {
            $result.json = $result.body | ConvertFrom-Json
        } catch {
            $result.json = $null
        }
    }
    return $result
}

function Test-ProductDtoFields($roleLabel, $headers, $expectImportPriceVisible) {
    $uri = "$baseUrl/products?page=0&pageSize=1"
    $result = Invoke-JsonCase "[$roleLabel] GET /api/products?page=0&pageSize=1" $uri $headers 200
    if (!$result.ok -or !$result.json -or !$result.json.items -or $result.json.items.Count -eq 0) {
        Write-Host "[$roleLabel] ProductDto field check -> SKIP no item/body" -ForegroundColor Yellow
        return $false
    }

    $first = $result.json.items[0]
    $visible = $null -ne $first.importPrice
    $ok = $visible -eq $expectImportPriceVisible
    $color = if ($ok) { "Green" } else { "Red" }
    Write-Host "[$roleLabel] ProductDto importPrice visible=$visible value=$($first.importPrice) expectedVisible=$expectImportPriceVisible result=$(Format-Result $ok)" -ForegroundColor $color
    return $ok
}

function Test-InventoryV2Fields($roleLabel, $headers, $expectCostVisible) {
    $uri = "$baseUrl/inventory/v2/products?page=0&size=1"
    $result = Invoke-JsonCase "[$roleLabel] GET /api/inventory/v2/products?page=0&size=1" $uri $headers 200
    if (!$result.ok -or !$result.json -or !$result.json.items -or $result.json.items.Count -eq 0) {
        Write-Host "[$roleLabel] InventoryV2 field check -> SKIP no item/body" -ForegroundColor Yellow
        return $false
    }

    $first = $result.json.items[0]
    $avgVisible = $null -ne $first.averageCost
    $stockVisible = $null -ne $first.stockValue
    $ok = ($avgVisible -eq $expectCostVisible) -and ($stockVisible -eq $expectCostVisible)
    $color = if ($ok) { "Green" } else { "Red" }
    Write-Host "[$roleLabel] InventoryV2 averageCost visible=$avgVisible value=$($first.averageCost); stockValue visible=$stockVisible value=$($first.stockValue); expectedVisible=$expectCostVisible result=$(Format-Result $ok)" -ForegroundColor $color
    return $ok
}

Write-Host "Authenticating users (Admin and Sales)..." -ForegroundColor Cyan
$salesToken = Get-Token "sales" (Get-RequiredEnv "SALES_PASSWORD")
$adminToken = Get-Token "admin" (Get-RequiredEnv "ADMIN_PASSWORD")

if (!$salesToken -or !$adminToken) {
    Write-Host "Authentication failed. Cannot run API security cases." -ForegroundColor Red
    exit 1
}

$salesHeader = @{ Authorization = "Bearer $salesToken" }
$adminHeader = @{ Authorization = "Bearer $adminToken" }
$allOk = $true

for ($round = 1; $round -le 2; $round++) {
    Write-Host ""
    Write-Host "=== ROUND ${round}: Sales/Admin API security checks ===" -ForegroundColor Yellow

    $misaUri = "$baseUrl/v1/sales/misa-export?startDate=2026-01-01&endDate=2026-01-31"
    $salesMisa = Invoke-HttpCase "[SALES] GET /api/v1/sales/misa-export" "Get" $misaUri $salesHeader 403
    $adminMisa = Invoke-HttpCase "[ADMIN] GET /api/v1/sales/misa-export" "Get" $misaUri $adminHeader 200

    $salesProductDto = Test-ProductDtoFields "SALES" $salesHeader $false
    $adminProductDto = Test-ProductDtoFields "ADMIN" $adminHeader $true

    $salesInventoryV2 = Test-InventoryV2Fields "SALES" $salesHeader $false
    $adminInventoryV2 = Test-InventoryV2Fields "ADMIN" $adminHeader $true

    $roundOk = $salesMisa.ok -and $adminMisa.ok -and $salesProductDto -and $adminProductDto -and $salesInventoryV2 -and $adminInventoryV2
    $allOk = $allOk -and $roundOk
    Write-Host "ROUND $round RESULT=$(Format-Result $roundOk)" -ForegroundColor $(if ($roundOk) { "Green" } else { "Red" })
}

Write-Host ""
Write-Host "FINAL RESULT=$(Format-Result $allOk)" -ForegroundColor $(if ($allOk) { "Green" } else { "Red" })
if (!$allOk) {
    exit 1
}

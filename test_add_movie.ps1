# Test Add Movie API
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUwMDEiLCJpYXQiOjE3MzE0MTI5NjEsImV4cCI6MTczMjAxNzc2MX0.YoZkiQfNs8s6bnH9PCbGgOoTrMGPRYOAOm8Eq_jBrTg"

$body = @{
    title = "Test Movie"
    poster_url = "https://example.com/poster.jpg"
    director = "Test Director"
    genre = "Action"
    duration = 120
    release_date = "2025-12-01"
    age_limit = 13
    status = "now-showing"
    description = "Test description"
    cast = @("Actor 1", "Actor 2")
    language = "English"
    rating = 0
} | ConvertTo-Json

Write-Host "Sending request with body:"
Write-Host $body

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://192.168.101.149:5000/api/v1/movies" -Method POST -Headers $headers -Body $body
    Write-Host "`n✅ Success:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`n❌ Error:"
    $_.Exception.Message
    if ($_.ErrorDetails) {
        $_.ErrorDetails.Message
    }
}

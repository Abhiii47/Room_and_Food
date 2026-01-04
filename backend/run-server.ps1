try {
    node Server.js 2>&1 | Tee-Object -Variable output
    Write-Host $output
} catch {
    Write-Host "Error: $_"
    Write-Host $_.Exception.Message
}

$src = "c:\Users\Aidan\Downloads\briefs-studio"
$dest = "c:\Users\Aidan\Downloads\signalform-briefs-main (2)"

Write-Host "Starting complete workspace sync..."
Write-Host "Source: $src"
Write-Host "Destination: $dest"
Write-Host "----------------------------------"

Get-ChildItem $src -Exclude ".git", "node_modules" | ForEach-Object {
    $itemDest = Join-Path $dest $_.Name
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
    } else {
        Copy-Item -Path $_.FullName -Destination $dest -Force
    }
    Write-Host "✅ Synced: $($_.Name)"
}

Write-Host "----------------------------------"
Write-Host "🎉 Sync complete! All rebranded changes are now mirrored to your active workspace."

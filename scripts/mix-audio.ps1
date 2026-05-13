# mix-audio.ps1 — Combine launch-reel.mp4 + music + optional narration
# Drop marketing/narration.mp3 then re-run this script to get the final mix.

$ff = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter "ffmpeg.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName)
if (-not $ff) { $ff = "ffmpeg" }

$video     = "marketing\launch-reel.mp4"
$music     = "public\music\cinematic.mp3"
$narration = "marketing\narration.mp3"
$output    = "marketing\launch-reel-audio.mp4"

if (Test-Path $narration) {
    Write-Host "Mixing video + music + narration..."
    & $ff -y `
      -i $video -i $music -i $narration `
      -filter_complex "[1:a]volume=0.12,afade=t=in:st=0:d=2,afade=t=out:st=57:d=3[music];[2:a]volume=1.0[voice];[music][voice]amix=inputs=2:duration=shortest[audio]" `
      -map "0:v" -map "[audio]" `
      -c:v copy -c:a aac -shortest `
      $output
} else {
    Write-Host "No narration.mp3 found — mixing video + music only..."
    & $ff -y `
      -i $video -i $music `
      -filter_complex "[1:a]volume=0.18,afade=t=in:st=0:d=2,afade=t=out:st=57:d=3[audio]" `
      -map "0:v" -map "[audio]" `
      -c:v copy -c:a aac -shortest `
      $output
}

Write-Host "Done -> $output ($([math]::Round((Get-Item $output).Length/1MB,1))MB)"

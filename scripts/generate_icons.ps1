Add-Type -AssemblyName System.Drawing

$iconsDir = "frontend\public\icons"
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
}

$srcPath = Resolve-Path "frontend\public\logo.png"
$src = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image([System.Drawing.Image]$image, [int]$w, [int]$h, [string]$dest) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($image, 0, 0, $w, $h)
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $dest ($w x $h)"
}

Resize-Image $src 192 192 "frontend\public\icons\icon-192.png"
Resize-Image $src 512 512 "frontend\public\icons\icon-512.png"
Resize-Image $src 180 180 "frontend\public\icons\apple-touch-icon.png"

function Create-MaskableIcon([System.Drawing.Image]$image, [int]$size, [string]$dest) {
    $maskableBmp = New-Object System.Drawing.Bitmap($size, $size)
    $mg = [System.Drawing.Graphics]::FromImage($maskableBmp)
    $mg.Clear([System.Drawing.Color]::FromArgb(255, 8, 12, 10))
    $mg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $mg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $padding = [int]($size * 0.1)
    $drawSize = $size - ($padding * 2)
    $mg.DrawImage($image, $padding, $padding, $drawSize, $drawSize)
    $maskableBmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $mg.Dispose()
    $maskableBmp.Dispose()
    Write-Host "Created $dest ($size x $size)"
}

Create-MaskableIcon $src 192 "frontend\public\icons\icon-maskable-192.png"
Create-MaskableIcon $src 512 "frontend\public\icons\icon-maskable-512.png"
Create-MaskableIcon $src 512 "frontend\public\icons\icon-maskable.png"

$src.Dispose()
Write-Host "All icons generated successfully!"

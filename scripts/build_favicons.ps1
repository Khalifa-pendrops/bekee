Add-Type -AssemblyName System.Drawing

function Render-BrandIcon {
    param(
        [int]$size
    )
    
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # 1. Circular disc with deep luxury oxblood background
    $pad = [Math]::Max(1.0, $size * 0.02)
    $discSize = $size - (2 * $pad)
    $rect = New-Object System.Drawing.RectangleF($pad, $pad, $discSize, $discSize)
    
    $cTop = [System.Drawing.Color]::FromArgb(255, 115, 22, 38)   # #731626
    $cBot = [System.Drawing.Color]::FromArgb(255, 48, 8, 16)     # #300810
    $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBot, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
    $g.FillEllipse($brushBg, $rect)
    
    # 2. Outer Warm Metallic Gold Rim
    $goldWidth = [Math]::Max(1.2, $size * 0.065)
    $penGold = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 218, 175, 60), $goldWidth)
    $g.DrawEllipse($penGold, $rect)
    
    # 3. Inner fine gold accent ring (only for 32px and larger)
    if ($size -ge 32) {
        $innerPad = [float]($size * 0.08)
        $rectInner = New-Object System.Drawing.RectangleF($innerPad, $innerPad, ($size - 2 * $innerPad), ($size - 2 * $innerPad))
        $penGoldInner = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(80, 218, 175, 60), 0.8)
        $g.DrawEllipse($penGoldInner, $rectInner)
    }
    
    # Scale helper (normalized to 64px design grid)
    $scale = $size / 64.0
    
    # 4. Shopping Bag Silhouette
    # Bag Handle (curved semicircle)
    $handleStroke = [Math]::Max(1.6, 3.2 * $scale)
    $penHandle = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 245, 215, 120), $handleStroke)
    $penHandle.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penHandle.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $handleRect = New-Object System.Drawing.RectangleF((23.5 * $scale), (14 * $scale), (17 * $scale), (18 * $scale))
    $g.DrawArc($penHandle, $handleRect, 180, 180)
    
    # Bag Body
    $p1 = New-Object System.Drawing.PointF((17 * $scale), (24.5 * $scale))
    $p2 = New-Object System.Drawing.PointF((47 * $scale), (24.5 * $scale))
    $p3 = New-Object System.Drawing.PointF((44 * $scale), (49.5 * $scale))
    $p4 = New-Object System.Drawing.PointF((20 * $scale), (49.5 * $scale))
    $bagPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $bagPath.AddPolygon(@($p1, $p2, $p3, $p4))
    
    # Dark luxury inner fill
    $brushBag = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 34, 4, 10))
    $g.FillPath($brushBag, $bagPath)
    
    # Gold bag outline
    $bagStroke = [Math]::Max(1.4, 2.2 * $scale)
    $penBagOutline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 225, 185, 75), $bagStroke)
    $penBagOutline.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawPath($penBagOutline, $bagPath)
    
    # 5. Bold Golden Monogram 'A' on bag center
    $fontSize = [float]($size * 0.28)
    $font = New-Object System.Drawing.Font("Georgia", $fontSize, [System.Drawing.FontStyle]::Bold)
    $brushText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 252, 238, 180))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $textRect = New-Object System.Drawing.RectangleF((17 * $scale), (25 * $scale), (30 * $scale), (25 * $scale))
    $g.DrawString("A", $font, $brushText, $textRect, $sf)
    
    # 6. Top-right sparkle star (for 32px and larger)
    if ($size -ge 32) {
        $starX = 47.0 * $scale
        $starY = 16.0 * $scale
        $starR = [Math]::Max(2.0, 3.5 * $scale)
        $brushStar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 248, 210))
        $g.FillEllipse($brushStar, ($starX - $starR * 0.5), ($starY - $starR * 0.5), $starR, $starR)
    }
    
    $g.Dispose()
    return $bmp
}

function Save-PngBytes {
    param([System.Drawing.Bitmap]$bmp)
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bytes = $ms.ToArray()
    $ms.Dispose()
    return $bytes
}

function Create-IcoFile {
    param(
        [string]$outputPath,
        [array]$pngByteArrays, # array of byte arrays, each representing a PNG
        [array]$sizes          # e.g. @(16, 32, 48)
    )
    
    $count = $pngByteArrays.Count
    $headerSize = 6
    $dirEntrySize = 16
    $allDirEntriesSize = $count * $dirEntrySize
    $currentOffset = $headerSize + $allDirEntriesSize
    
    $ms = New-Object System.IO.MemoryStream
    $bw = New-Object System.IO.BinaryWriter($ms)
    
    # ICO Header
    $bw.Write([UInt16]0)      # Reserved
    $bw.Write([UInt16]1)      # Type: 1 = ICO
    $bw.Write([UInt16]$count) # Number of images
    
    # Compute offsets
    $offsets = @()
    for ($i = 0; $i -lt $count; $i++) {
        $offsets += $currentOffset
        $currentOffset += $pngByteArrays[$i].Length
    }
    
    # Directory entries
    for ($i = 0; $i -lt $count; $i++) {
        $sz = $sizes[$i]
        $w = if ($sz -ge 256) { 0 } else { [byte]$sz }
        $h = if ($sz -ge 256) { 0 } else { [byte]$sz }
        $dataLen = $pngByteArrays[$i].Length
        $offset = $offsets[$i]
        
        $bw.Write($w)             # Width
        $bw.Write($h)             # Height
        $bw.Write([byte]0)        # Color count
        $bw.Write([byte]0)        # Reserved
        $bw.Write([UInt16]1)      # Color planes
        $bw.Write([UInt16]32)     # Bits per pixel
        $bw.Write([UInt32]$dataLen) # Data length
        $bw.Write([UInt32]$offset)  # Data offset
    }
    
    # PNG payloads
    for ($i = 0; $i -lt $count; $i++) {
        $pBytes = [byte[]]$pngByteArrays[$i]
        $bw.Write($pBytes, 0, $pBytes.Length)
    }
    
    $bw.Flush()
    $fileBytes = $ms.ToArray()
    $bw.Dispose()
    $ms.Dispose()
    
    [System.IO.File]::WriteAllBytes($outputPath, $fileBytes)
}

$publicDir = "d:\Dev Projects\bekee\collection\public"
$appDir    = "d:\Dev Projects\bekee\collection\src\app"

# Generate bitmaps
$bmp16  = Render-BrandIcon -size 16
$bmp32  = Render-BrandIcon -size 32
$bmp48  = Render-BrandIcon -size 48
$bmp64  = Render-BrandIcon -size 64
$bmp180 = Render-BrandIcon -size 180
$bmp192 = Render-BrandIcon -size 192
$bmp512 = Render-BrandIcon -size 512

# Save individual PNGs to public
$bmp16.Save("$publicDir\favicon-16x16.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp32.Save("$publicDir\favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Save("$publicDir\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Save("$publicDir\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Save("$publicDir\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Save Next.js App Router convention icons
$bmp32.Save("$appDir\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Save("$appDir\apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Package Multi-Resolution PNG-in-ICO (16, 32, 48)
$png16Bytes = Save-PngBytes $bmp16
$png32Bytes = Save-PngBytes $bmp32
$png48Bytes = Save-PngBytes $bmp48

Create-IcoFile -outputPath "$publicDir\favicon.ico" -pngByteArrays @($png16Bytes, $png32Bytes, $png48Bytes) -sizes @(16, 32, 48)
Create-IcoFile -outputPath "$appDir\favicon.ico" -pngByteArrays @($png16Bytes, $png32Bytes, $png48Bytes) -sizes @(16, 32, 48)

$bmp16.Dispose()
$bmp32.Dispose()
$bmp48.Dispose()
$bmp64.Dispose()
$bmp180.Dispose()
$bmp192.Dispose()
$bmp512.Dispose()

Write-Output "Successfully generated all brand favicons & PNG icons!"

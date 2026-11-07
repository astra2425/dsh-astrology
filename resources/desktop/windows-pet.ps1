$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase

$owner = [Diagnostics.Process]::GetProcessById([int]$env:DSH_ASTROLOGY_PET_OWNER)
$assets = $env:DSH_ASTROLOGY_PET_ASSETS
$clip = (Get-Content -LiteralPath (Join-Path $assets 'pet-atlas.json') -Raw | ConvertFrom-Json).clips.idle
$atlas = [Windows.Media.Imaging.BitmapImage]::new([Uri]::new((Join-Path $assets 'frames-idle.png')))
$frames = @($clip.frames | ForEach-Object {
    $rect = [Windows.Int32Rect]::new([int]$_.x, [int]$_.y, [int]$_.width, [int]$_.height)
    [Windows.Media.Imaging.CroppedBitmap]::new($atlas, $rect)
})
if ($frames.Count -eq 0) { throw 'Missing companion frames' }

$window = [Windows.Window]::new()
$window.Title = 'Astrology Companion'
$window.Width = 118
$window.Height = 168
$window.WindowStyle = 'None'
$window.ResizeMode = 'NoResize'
$window.AllowsTransparency = $true
$window.Background = [Windows.Media.Brushes]::Transparent
$window.Topmost = $true
$window.ShowInTaskbar = $false
$window.ShowActivated = $false
$window.WindowStartupLocation = 'Manual'
$workArea = [Windows.SystemParameters]::WorkArea
$window.Left = $workArea.Right - $window.Width - 20
$window.Top = $workArea.Bottom - $window.Height - 20

$image = [Windows.Controls.Image]::new()
$image.Source = $frames[0]
$image.Stretch = 'Uniform'
$image.ToolTip = 'Astrology'
$window.Content = $image
$image.Add_MouseLeftButtonDown({ try { $window.DragMove() } catch [InvalidOperationException] {} })
$menu = [Windows.Controls.ContextMenu]::new()
$closeItem = [Windows.Controls.MenuItem]::new()
$closeItem.Header = 'Close Astrology companion'
$closeItem.Add_Click({ $window.Close() })
[void]$menu.Items.Add($closeItem)
$image.ContextMenu = $menu

$script:frame = 0
$timer = [Windows.Threading.DispatcherTimer]::new()
$timer.Interval = [TimeSpan]::FromMilliseconds(130)
$timer.Add_Tick({
    if ($owner.HasExited) { $window.Close(); return }
    $script:frame = ($script:frame + 1) % $frames.Count
    $image.Source = $frames[$script:frame]
})
$window.Add_Closed({ $timer.Stop(); $owner.Dispose() })
$window.Add_ContentRendered({ [Console]::WriteLine('ASTROLOGY_PET_READY') })
$timer.Start()
[void]$window.ShowDialog()

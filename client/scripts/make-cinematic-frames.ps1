# Rebuilds the home page film frames (client/public/images/cinematic/{d,m}) from the 3D animation.
# Usage (from client/): .\scripts\make-cinematic-frames.ps1 -In path\to\3D-Animation.mov -Out public\images\cinematic
# Needs ffmpeg. "d" = 1280px landscape frames, "m" = 540px portrait crop for phones.
param([string]$In, [string]$Out)
# Chapters of the flythrough (seconds), trimmed inside each hard cut and past the opening fade-in.
# Frame counts per chapter must match CHAPTERS in app/_components/CinematicFilm.tsx.
$segments = @(
  @(0.8, 3.55),   # aerial approach to the tower
  @(3.65, 8.35),   # rooftop crown
  @(8.45, 12.95),  # ski slope
  @(19.65, 25.5),  # mini golf
  @(30.65, 36.8)   # pull-back over the resort to the tower
)
$fps = 4
$tmp = Join-Path $Out "_tmp"
foreach ($set in "d", "m") {
  $dir = Join-Path $Out $set
  New-Item -ItemType Directory -Force $dir | Out-Null
  Get-ChildItem $dir -Filter *.webp -ErrorAction SilentlyContinue | Remove-Item
}
$n = 0
$counts = @()
for ($i = 0; $i -lt $segments.Count; $i++) {
  $s = $segments[$i][0]; $e = $segments[$i][1]; $len = $e - $s
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force "$tmp\d", "$tmp\m" | Out-Null
  ffmpeg -v error -y -ss $s -t $len -i $In -an -vf "fps=$fps,scale=1280:-2,hqdn3d=1.5:1.5:0:0" -c:v libwebp -quality 42 -compression_level 6 "$tmp\d\%03d.webp"
  ffmpeg -v error -y -ss $s -t $len -i $In -an -vf "fps=$fps,crop=720:1080,scale=540:810,hqdn3d=1.5:1.5:0:0" -c:v libwebp -quality 40 -compression_level 6 "$tmp\m\%03d.webp"
  $frames = Get-ChildItem "$tmp\d" -Filter *.webp | Sort-Object Name
  foreach ($f in $frames) {
    $name = "{0:D3}.webp" -f $n
    Move-Item $f.FullName (Join-Path $Out "d\$name")
    Move-Item (Join-Path "$tmp\m" $f.Name) (Join-Path $Out "m\$name")
    $n++
  }
  $counts += $frames.Count
}
Remove-Item -Recurse -Force $tmp
"chapter frame counts: " + ($counts -join ",") + "  total: $n"
foreach ($set in "d", "m") {
  $fs = Get-ChildItem (Join-Path $Out $set) -Filter *.webp
  "{0}: {1:N1} MB" -f $set, (($fs | Measure-Object Length -Sum).Sum / 1MB)
}

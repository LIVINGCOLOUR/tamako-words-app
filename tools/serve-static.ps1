param([int]$Port = 8765)

$siteRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse('127.0.0.1'), $Port)
$listener.Start()
Write-Host "http://127.0.0.1:$Port/"

function Get-ContentType([string]$Path) {
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    '.html' { 'text/html; charset=utf-8' }
    '.css' { 'text/css; charset=utf-8' }
    '.js' { 'text/javascript; charset=utf-8' }
    '.json' { 'application/json; charset=utf-8' }
    '.png' { 'image/png' }
    '.jpg' { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.wav' { 'audio/wav' }
    default { 'application/octet-stream' }
  }
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      do { $line = $reader.ReadLine() } while ($null -ne $line -and $line.Length -gt 0)
      if (-not $requestLine) { $client.Close(); continue }
      $parts = $requestLine.Split(' ')
      $urlPath = if ($parts.Length -ge 2) { $parts[1] } else { '/' }
      $pathOnly = $urlPath.Split('?')[0].TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($pathOnly)) { $pathOnly = 'index.html' }
      $pathOnly = [uri]::UnescapeDataString($pathOnly) -replace '/', [System.IO.Path]::DirectorySeparatorChar
      $full = [System.IO.Path]::GetFullPath((Join-Path $siteRoot $pathOnly))
      $rootPrefix = $siteRoot.TrimEnd('\') + '\'
      if (-not $full.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('not found')
        $head = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n")
        $stream.Write($head,0,$head.Length); $stream.Write($body,0,$body.Length); $client.Close(); continue
      }
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $contentType = Get-ContentType $full
      $header = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n")
      $stream.Write($header,0,$header.Length)
      $stream.Write($bytes,0,$bytes.Length)
      $client.Close()
    } catch {
      try { $client.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}


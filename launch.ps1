# Nakshatra Business Advisory — local CMS launcher (Windows PowerShell)
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not $env:PORT) { $env:PORT = "3000" }
$url = "http://localhost:$($env:PORT)"
$admin = "$url/admin"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required. Install it from https://nodejs.org"
  exit 1
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies (first run, this may take a minute)..."
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
  } else {
    npm install
  }
}

Write-Host ""
Write-Host "  Nakshatra Business Advisory - local CMS"
Write-Host "  ----------------------------------------"
Write-Host "  Site  :  $url"
Write-Host "  Admin :  $admin"
Write-Host "  Press Ctrl+C to stop."
Write-Host ""

Start-Process $url
node server.js

param([string]$JavaHome = $env:JAVA_HOME)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if ($JavaHome) { $env:JAVA_HOME = $JavaHome }
if (-not (Test-Path -LiteralPath 'android/keystore.properties')) {
    throw 'Release signing requires android/keystore.properties and the matching keystore. See release/BUILD-NOTES.txt.'
}
& npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Web build failed.' }
& npx.cmd cap sync android
if ($LASTEXITCODE -ne 0) { throw 'Capacitor sync failed.' }
& ./android/gradlew.bat -p android assembleRelease --console=plain
if ($LASTEXITCODE -ne 0) { throw 'Android release build failed.' }
New-Item -ItemType Directory -Force release | Out-Null
Copy-Item -LiteralPath 'android/app/build/outputs/apk/release/app-release.apk' -Destination 'release/FinTrack-1.2.0-release.apk'
Get-FileHash -LiteralPath 'release/FinTrack-1.2.0-release.apk' -Algorithm SHA256

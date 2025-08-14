@echo off
echo Installing cross-env...
npm install --save-dev cross-env

echo Modifying package.json...
powershell -Command ^
  "$pkg = Get-Content -Raw -Path 'package.json' | ConvertFrom-Json; ^
   if (-not $pkg.scripts) { $pkg | Add-Member -MemberType NoteProperty -Name scripts -Value @{} }; ^
   $pkg.scripts.dev = 'set NODE_ENV=development && tsx server/index.ts'; ^
   $pkg | ConvertTo-Json -Depth 10 | Set-Content -Path 'package.json'"

echo Done.

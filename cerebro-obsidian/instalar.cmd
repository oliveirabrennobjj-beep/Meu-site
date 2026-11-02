@echo off
chcp 65001 >nul
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e rode de novo.
  echo.
  pause
  exit /b 1
)
node "%~dp0instalar.mjs" %*
echo.
pause

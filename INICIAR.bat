@echo off
chcp 65001 >nul
title Mi Cubo Magico
cd /d "%~dp0"
echo.
echo   Arrancando Mi Cubo Magico...
echo.
start "" http://localhost:8080
node server.js
pause

@echo off
chcp 65001 >nul
title ZKXY CRM PRO - 一键启动

echo ========================================
echo   ZKXY CRM PRO 一键启动脚本
echo ========================================
echo.

:: 进入项目目录
cd /d "%~dp0"

echo [1/2] 启动后端服务 (FastAPI, 端口 8000)...
start "CRM-Backend" cmd /k "cd /d %~dp0 && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: 等待后端启动
timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务 (Vite, 端口 3000)...
start "CRM-Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo   启动完成！
echo   前端: http://localhost:3000
echo   后端: http://localhost:8000
echo ========================================
echo.
echo 提示: 关闭此窗口不会影响前后端运行。
echo 如需停止服务，请关闭对应的 CRM-Backend 和 CRM-Frontend 窗口。
echo.
pause

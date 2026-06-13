@echo off
cd /d D:\ChuanPhat\frontend
set PATH=D:\ChuanPhat\.runtime\node-v22.13.1-win-x64;%PATH%
set NEXT_PUBLIC_API_URL=http://localhost:8080
D:\ChuanPhat\.runtime\node-v22.13.1-win-x64\node.exe node_modules\next\dist\bin\next start --hostname 0.0.0.0 --port 3000 >> frontend-live.log 2>&1

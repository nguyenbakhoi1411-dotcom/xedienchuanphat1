@echo off
cd /d D:\ChuanPhat
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=C:\Program Files\Java\jdk-17\bin;%PATH%
mvnw.cmd spring-boot:run > backend-live.shell.log 2>&1

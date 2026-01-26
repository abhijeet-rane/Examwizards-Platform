@echo off
REM ExamPort Docker Build and Push Script for Windows
REM This script builds all Docker images and pushes them to Docker Hub

setlocal

set DOCKER_USERNAME=abhijeetrane204
set PROJECT_NAME=examport

echo ==========================================
echo ExamPort Docker Build Script
echo ==========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Login to Docker Hub
echo Logging in to Docker Hub...
docker login

echo.
echo ==========================================
echo Building Backend Image
echo ==========================================
cd backend
docker build -t %DOCKER_USERNAME%/%PROJECT_NAME%-backend:latest .
echo Backend image built successfully!

echo.
echo ==========================================
echo Building Frontend Image
echo ==========================================
cd ..\frontend
docker build -t %DOCKER_USERNAME%/%PROJECT_NAME%-frontend:latest .
echo Frontend image built successfully!

echo.
echo ==========================================
echo Building Monolith Image
echo ==========================================
cd ..
docker build -t %DOCKER_USERNAME%/%PROJECT_NAME%-monolith:latest .
echo Monolith image built successfully!

echo.
echo ==========================================
echo Pushing Images to Docker Hub
echo ==========================================

echo Pushing backend image...
docker push %DOCKER_USERNAME%/%PROJECT_NAME%-backend:latest

echo Pushing frontend image...
docker push %DOCKER_USERNAME%/%PROJECT_NAME%-frontend:latest

echo Pushing monolith image...
docker push %DOCKER_USERNAME%/%PROJECT_NAME%-monolith:latest

echo.
echo ==========================================
echo Build and Push Complete!
echo ==========================================
echo.
echo Your images are now available at:
echo   - https://hub.docker.com/r/%DOCKER_USERNAME%/%PROJECT_NAME%-backend
echo   - https://hub.docker.com/r/%DOCKER_USERNAME%/%PROJECT_NAME%-frontend
echo   - https://hub.docker.com/r/%DOCKER_USERNAME%/%PROJECT_NAME%-monolith
echo.
echo To run the monolith:
echo   docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env %DOCKER_USERNAME%/%PROJECT_NAME%-monolith:latest
echo.

endlocal

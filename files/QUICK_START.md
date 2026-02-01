# ExamPort Docker Quick Start Guide

## For Submission

Your Docker images will be available at:
- **Monolith**: `docker pull abhijeetrane204/examport-monolith:latest`
- **Frontend**: `docker pull abhijeetrane204/examport-frontend:latest`
- **Backend**: `docker pull abhijeetrane204/examport-backend:latest`

## Quick Commands

### 1. Build All Images (One Command)

**Windows:**
```cmd
build-all.bat
```

**Linux/Mac:**
```bash
chmod +x build-all.sh
./build-all.sh
```

### 2. Run Monolith (Easiest)

```bash
# Create .env file first (copy from .env.example)
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```

Access at: http://localhost:3000

### 3. Run with Docker Compose (Recommended)

```bash
# Setup
cp .env.example .env
# Edit .env with your credentials

# Start
docker-compose up -d

# Stop
docker-compose down
```

## Step-by-Step Build Process

### Step 1: Prepare Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual credentials
# Required: EMAIL_USERNAME, EMAIL_PASSWORD, RAZORPAY keys, etc.
```

### Step 2: Build Individual Images

**Backend:**
```bash
cd backend
docker build -t abhijeetrane204/examport-backend:latest .
docker push abhijeetrane204/examport-backend:latest
cd ..
```

**Frontend:**
```bash
cd frontend
docker build -t abhijeetrane204/examport-frontend:latest .
docker push abhijeetrane204/examport-frontend:latest
cd ..
```

**Monolith:**
```bash
docker build -t abhijeetrane204/examport-monolith:latest .
docker push abhijeetrane204/examport-monolith:latest
```

### Step 3: Test Locally

**Test Backend:**
```bash
docker run -p 8080:8080 --env-file .env abhijeetrane204/examport-backend:latest
```

**Test Frontend:**
```bash
docker run -p 3000:3000 abhijeetrane204/examport-frontend:latest
```

**Test Monolith:**
```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```

## Submission Format

Provide these commands in your submission:

```bash
# Pull images
docker pull abhijeetrane204/examport-backend:latest
docker pull abhijeetrane204/examport-frontend:latest
docker pull abhijeetrane204/examport-monolith:latest

# Run monolith
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```

## Docker Hub Links

After pushing, your images will be at:
- https://hub.docker.com/r/abhijeetrane204/examport-monolith
- https://hub.docker.com/r/abhijeetrane204/examport-frontend
- https://hub.docker.com/r/abhijeetrane204/examport-backend

## Troubleshooting

**Build fails?**
- Ensure Docker is running
- Check internet connection
- Verify all files are present

**Container won't start?**
- Check .env file exists and has correct values
- Verify ports 3000, 8080, 3306 are not in use
- Check logs: `docker logs <container-name>`

**Can't push to Docker Hub?**
- Login first: `docker login`
- Verify username is correct: abhijeetrane204

## Need Help?

Check the detailed guide: `BUILD_AND_DEPLOY.md`

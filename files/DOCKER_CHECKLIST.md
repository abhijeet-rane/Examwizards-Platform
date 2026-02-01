# ExamPort Docker Build & Submission Checklist

## Pre-Build Checklist

- [ ] Docker Desktop is installed and running
- [ ] Docker Hub account created (username: abhijeetrane204)
- [ ] Logged into Docker Hub (`docker login`)
- [ ] All project files are present
- [ ] `.env` file created from `.env.example`
- [ ] Environment variables configured in `.env`

## Build Checklist

### Step 1: Prepare Environment
- [ ] Copy `.env.example` to `.env`
- [ ] Update `.env` with actual credentials:
  - [ ] EMAIL_USERNAME
  - [ ] EMAIL_PASSWORD
  - [ ] RAZORPAY_KEY_ID
  - [ ] RAZORPAY_KEY_SECRET
  - [ ] GENAI_API_KEY
  - [ ] JWT_SECRET

### Step 2: Build Images

#### Option A: Automated (Recommended)
- [ ] Run `build-all.bat` (Windows) or `./build-all.sh` (Linux/Mac)
- [ ] Wait for all builds to complete
- [ ] Verify no errors in output

#### Option B: Manual
- [ ] Build backend: `cd backend && docker build -t abhijeetrane204/examport-backend:latest .`
- [ ] Build frontend: `cd frontend && docker build -t abhijeetrane204/examport-frontend:latest .`
- [ ] Build monolith: `docker build -t abhijeetrane204/examport-monolith:latest .`

### Step 3: Verify Local Images
```bash
docker images | grep examport
```
- [ ] abhijeetrane204/examport-backend:latest exists
- [ ] abhijeetrane204/examport-frontend:latest exists
- [ ] abhijeetrane204/examport-monolith:latest exists

### Step 4: Push to Docker Hub
- [ ] Push backend: `docker push abhijeetrane204/examport-backend:latest`
- [ ] Push frontend: `docker push abhijeetrane204/examport-frontend:latest`
- [ ] Push monolith: `docker push abhijeetrane204/examport-monolith:latest`

### Step 5: Verify on Docker Hub
Visit these URLs and verify images are public:
- [ ] https://hub.docker.com/r/abhijeetrane204/examport-backend
- [ ] https://hub.docker.com/r/abhijeetrane204/examport-frontend
- [ ] https://hub.docker.com/r/abhijeetrane204/examport-monolith

## Testing Checklist

### Test 1: Pull Images
```bash
docker pull abhijeetrane204/examport-backend:latest
docker pull abhijeetrane204/examport-frontend:latest
docker pull abhijeetrane204/examport-monolith:latest
```
- [ ] All images pulled successfully

### Test 2: Run Monolith
```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```
- [ ] Container starts without errors
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responds at http://localhost:8080/api
- [ ] No error messages in logs

### Test 3: Run Individual Containers
- [ ] MySQL container starts
- [ ] Backend container starts and connects to MySQL
- [ ] Frontend container starts
- [ ] All services communicate properly

### Test 4: Run with Docker Compose
```bash
docker-compose up -d
```
- [ ] All services start successfully
- [ ] Application is fully functional
- [ ] Can create users and login
- [ ] Can access all features

## Submission Checklist

### Documentation
- [ ] README.md updated with Docker instructions
- [ ] DOCKER_HUB_README.md ready for Docker Hub description
- [ ] All Dockerfiles are properly commented
- [ ] Environment variables documented

### Files to Submit
- [ ] Dockerfile (monolith)
- [ ] backend/Dockerfile
- [ ] frontend/Dockerfile
- [ ] docker-compose.yml
- [ ] .dockerignore
- [ ] .env.example
- [ ] nginx.conf files
- [ ] supervisord.conf
- [ ] init-mysql.sh
- [ ] BUILD_AND_DEPLOY.md
- [ ] SUBMISSION_COMMANDS.md

### Submission Information
```
Student Name: [Your Name]
Docker Hub Username: abhijeetrane204

Docker Images:
1. Monolith: abhijeetrane204/examport-monolith:latest
   Link: https://hub.docker.com/r/abhijeetrane204/examport-monolith

2. Frontend: abhijeetrane204/examport-frontend:latest
   Link: https://hub.docker.com/r/abhijeetrane204/examport-frontend

3. Backend: abhijeetrane204/examport-backend:latest
   Link: https://hub.docker.com/r/abhijeetrane204/examport-backend

Run Command (Monolith):
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest

Access URL: http://localhost:3000
```

## Common Issues & Solutions

### Issue: Build fails with "no space left on device"
```bash
docker system prune -a
```

### Issue: Port already in use
```bash
# Windows
netstat -ano | findstr "3000"
netstat -ano | findstr "8080"
netstat -ano | findstr "3306"

# Linux/Mac
lsof -i :3000
lsof -i :8080
lsof -i :3306
```

### Issue: Cannot push to Docker Hub
```bash
docker login
# Enter username: abhijeetrane204
# Enter password: [your-docker-hub-password]
```

### Issue: Container exits immediately
```bash
# Check logs
docker logs <container-name>

# Run in interactive mode to see errors
docker run -it abhijeetrane204/examport-monolith:latest /bin/bash
```

### Issue: MySQL connection refused
- [ ] Ensure MySQL container is running
- [ ] Check DB_URL in environment variables
- [ ] Verify network connectivity between containers

## Final Verification

Before submission, verify:
- [ ] All three images are public on Docker Hub
- [ ] Images can be pulled without authentication
- [ ] Monolith runs successfully with provided command
- [ ] Application is accessible at http://localhost:3000
- [ ] All features work (login, exam creation, etc.)
- [ ] Documentation is complete and accurate
- [ ] .env.example provided (not actual .env with secrets)

## Submission Package

Create a submission document with:
1. Docker Hub username
2. Links to all three images
3. Pull commands
4. Run commands
5. Access URLs
6. Brief description of the application
7. Technology stack
8. Any special instructions

## Post-Submission

- [ ] Keep images public on Docker Hub
- [ ] Maintain repository with all Docker files
- [ ] Be ready to demonstrate if required
- [ ] Have .env file ready for testing (don't submit actual secrets)

---

## Quick Command Reference

```bash
# Build all
./build-all.sh  # or build-all.bat on Windows

# Test locally
docker-compose up -d

# Push all
docker push abhijeetrane204/examport-backend:latest
docker push abhijeetrane204/examport-frontend:latest
docker push abhijeetrane204/examport-monolith:latest

# Run monolith
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```

Good luck with your submission! 🚀

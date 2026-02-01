# 🎯 START HERE - ExamPort Docker Setup

## 📌 What You Need to Do

Follow these steps in order to build and submit your Docker images.

---

## ✅ Step 1: Prerequisites (5 minutes)

### Install Docker
- Download Docker Desktop: https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop
- Verify installation:
  ```bash
  docker --version
  docker info
  ```

### Create Docker Hub Account
- Go to: https://hub.docker.com
- Sign up (if not already done)
- Your username: **abhijeetrane204**

### Login to Docker
```bash
docker login
# Username: abhijeetrane204
# Password: [your-docker-hub-password]
```

---

## ✅ Step 2: Prepare Environment (3 minutes)

### Create .env file
```bash
# Copy the example file
copy .env.example .env

# Edit .env with your actual credentials
# Use Notepad, VS Code, or any text editor
```

### Update these values in .env:
```env
EMAIL_USERNAME=abhijeetrane204@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
GENAI_API_KEY=your-gemini-api-key
JWT_SECRET=your-strong-secret-key
```

---

## ✅ Step 3: Build All Images (15-20 minutes)

### Windows Users:
```cmd
build-all.bat
```

### Linux/Mac Users:
```bash
chmod +x build-all.sh
./build-all.sh
```

### What This Does:
1. ✅ Builds backend image
2. ✅ Builds frontend image
3. ✅ Builds monolith image
4. ✅ Pushes all images to Docker Hub

**Wait for completion** - This takes 15-20 minutes depending on your internet speed.

---

## ✅ Step 4: Verify Images (2 minutes)

### Check Local Images
```bash
docker images | findstr examport
```

You should see:
- abhijeetrane204/examport-backend:latest
- abhijeetrane204/examport-frontend:latest
- abhijeetrane204/examport-monolith:latest

### Check Docker Hub
Visit these URLs in your browser:
1. https://hub.docker.com/r/abhijeetrane204/examport-backend
2. https://hub.docker.com/r/abhijeetrane204/examport-frontend
3. https://hub.docker.com/r/abhijeetrane204/examport-monolith

All should show "Public" and have the "latest" tag.

---

## ✅ Step 5: Test Locally (5 minutes)

### Test Monolith
```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```

### Access Application
Open browser: **http://localhost:3000**

You should see the ExamPort landing page.

### Stop Container
Press `Ctrl+C` in terminal

---

## ✅ Step 6: Prepare Submission (5 minutes)

### Copy This Information:

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

Pull Commands:
docker pull abhijeetrane204/examport-backend:latest
docker pull abhijeetrane204/examport-frontend:latest
docker pull abhijeetrane204/examport-monolith:latest

Run Command (Monolith):
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest

Access URL:
http://localhost:3000

Technology Stack:
- Backend: Spring Boot 2.7.18, Java 17, MySQL 8.0
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Deployment: Docker, Nginx

Features:
- Multi-role system (Admin, Instructor, Student)
- Exam creation and management
- Real-time results and analytics
- Payment integration (Razorpay)
- AI-powered chatbot (Google Gemini)
- Email notifications
- JWT authentication
```

---

## 📋 Quick Reference

### All Commands in One Place

```bash
# 1. Login
docker login

# 2. Build all images
build-all.bat  # Windows
./build-all.sh # Linux/Mac

# 3. Verify
docker images | findstr examport

# 4. Test
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest

# 5. Access
# Open: http://localhost:3000
```

---

## 🆘 Troubleshooting

### Problem: Build script doesn't work

**Solution**: Build manually
```bash
# Backend
cd backend
docker build -t abhijeetrane204/examport-backend:latest .
docker push abhijeetrane204/examport-backend:latest
cd ..

# Frontend
cd frontend
docker build -t abhijeetrane204/examport-frontend:latest .
docker push abhijeetrane204/examport-frontend:latest
cd ..

# Monolith
docker build -t abhijeetrane204/examport-monolith:latest .
docker push abhijeetrane204/examport-monolith:latest
```

### Problem: Port already in use

**Solution**: Stop other services
```bash
# Windows - Find what's using the port
netstat -ano | findstr "3000"
netstat -ano | findstr "8080"

# Kill the process or use different ports
docker run -p 3001:3000 -p 8081:8080 -p 3307:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```

### Problem: Docker login fails

**Solution**: 
1. Verify username: abhijeetrane204
2. Use Docker Hub password (not email password)
3. Try: `docker logout` then `docker login` again

### Problem: Build takes too long

**Solution**: This is normal
- Backend build: 5-8 minutes
- Frontend build: 3-5 minutes
- Monolith build: 10-15 minutes
- Total: 15-20 minutes

### Problem: Container exits immediately

**Solution**: Check logs
```bash
docker ps -a  # Find container ID
docker logs <container-id>
```

---

## 📚 Additional Documentation

If you need more details, check these files:

1. **QUICK_START.md** - Quick reference guide
2. **BUILD_AND_DEPLOY.md** - Detailed deployment guide
3. **SUBMISSION_COMMANDS.md** - All submission commands
4. **DOCKER_CHECKLIST.md** - Complete checklist
5. **README_DOCKER.md** - Comprehensive Docker guide

---

## ✨ Success Criteria

You're done when:
- ✅ All 3 images are on Docker Hub
- ✅ Images are public (anyone can pull)
- ✅ Monolith runs successfully
- ✅ Application accessible at http://localhost:3000
- ✅ You have submission information ready

---

## 🎉 Final Step

Submit the information from **Step 6** to your instructor/evaluator.

**Good luck! 🚀**

---

## 📞 Need Help?

1. Check troubleshooting section above
2. Review error messages carefully
3. Check Docker logs: `docker logs <container-name>`
4. Verify .env file has correct values
5. Ensure Docker Desktop is running

---

**Estimated Total Time: 30-40 minutes**

**Remember**: The build process is automated. Just run the script and wait!

# 🐳 ExamPort Docker Deployment Guide

Complete Docker setup for ExamPort - Online Examination Platform

## 📦 What's Included

This repository contains Docker configurations for:

1. **Backend** - Spring Boot REST API (Java 17)
2. **Frontend** - React + TypeScript SPA
3. **Monolith** - All-in-one container (MySQL + Backend + Frontend)

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Step 2: Build & Push Images
```bash
# Windows
build-all.bat

# Linux/Mac
chmod +x build-all.sh
./build-all.sh
```

### Step 3: Run Application
```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```

Access at: **http://localhost:3000**

## 📋 Docker Images

| Image | Description | Size | Pull Command |
|-------|-------------|------|--------------|
| **Monolith** | MySQL + Backend + Frontend | ~1.5GB | `docker pull abhijeetrane204/examport-monolith:latest` |
| **Backend** | Spring Boot API only | ~400MB | `docker pull abhijeetrane204/examport-backend:latest` |
| **Frontend** | React SPA with Nginx | ~50MB | `docker pull abhijeetrane204/examport-frontend:latest` |

## 🔗 Docker Hub Links

- 🏢 **Monolith**: https://hub.docker.com/r/abhijeetrane204/examport-monolith
- 🔧 **Backend**: https://hub.docker.com/r/abhijeetrane204/examport-backend
- 🎨 **Frontend**: https://hub.docker.com/r/abhijeetrane204/examport-frontend

## 🛠️ Deployment Options

### Option 1: Monolith (Recommended for Demo)

Single container with everything included:

```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 \
  --env-file .env \
  abhijeetrane204/examport-monolith:latest
```

**Pros:**
- ✅ Easiest to deploy
- ✅ Single command
- ✅ No network configuration needed

**Cons:**
- ❌ Larger image size
- ❌ Less flexible scaling

### Option 2: Individual Containers

Separate containers for each service:

```bash
# MySQL
docker run -d --name examport-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=examwizards \
  -p 3306:3306 \
  mysql:8.0

# Backend
docker run -d --name examport-backend \
  -p 8080:8080 \
  --link examport-mysql:mysql \
  --env-file .env \
  abhijeetrane204/examport-backend:latest

# Frontend
docker run -d --name examport-frontend \
  -p 3000:3000 \
  abhijeetrane204/examport-frontend:latest
```

**Pros:**
- ✅ Better resource management
- ✅ Independent scaling
- ✅ Easier debugging

**Cons:**
- ❌ More complex setup
- ❌ Network configuration required

### Option 3: Docker Compose (Best for Development)

```bash
docker-compose up -d
```

**Pros:**
- ✅ Easy multi-container management
- ✅ Automatic networking
- ✅ Volume management
- ✅ One command start/stop

**Cons:**
- ❌ Requires docker-compose.yml

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Monolith Container                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │    MySQL     │ │
│  │  (Nginx)     │  │ (Spring Boot)│  │   Database   │ │
│  │  Port: 3000  │  │  Port: 8080  │  │  Port: 3306  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### Required Environment Variables

```env
# Database
DB_PASSWORD=root

# Email (Gmail SMTP)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# AI Integration (Google Gemini)
GENAI_API_KEY=your-api-key

# Security
JWT_SECRET=your-jwt-secret
```

### Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React application |
| Backend | 8080 | REST API |
| MySQL | 3306 | Database |

## 📁 Project Structure

```
examport/
├── backend/
│   ├── Dockerfile              # Backend image
│   ├── src/
│   └── pom.xml
├── frontend/
│   ├── Dockerfile              # Frontend image
│   ├── nginx.conf              # Nginx config
│   └── src/
├── Dockerfile                  # Monolith image
├── docker-compose.yml          # Compose config
├── .dockerignore               # Ignore patterns
├── .env.example                # Environment template
├── nginx-monolith.conf         # Monolith nginx
├── supervisord.conf            # Process manager
├── init-mysql.sh               # MySQL init script
├── build-all.sh                # Build script (Linux/Mac)
├── build-all.bat               # Build script (Windows)
└── Documentation files
```

## 🎯 Features

- 👥 **Multi-role System**: Admin, Instructor, Student
- 📝 **Exam Management**: Create, edit, and manage exams
- 📊 **Analytics**: Real-time results and statistics
- 💳 **Payment Integration**: Razorpay payment gateway
- 🤖 **AI Chatbot**: Google Gemini powered assistant
- 📧 **Email Notifications**: Automated email system
- 🔐 **Security**: JWT authentication & authorization
- 📱 **Responsive**: Mobile-friendly design

## 🧪 Testing

### Test Backend
```bash
curl http://localhost:8080/api/health
```

### Test Frontend
```bash
curl http://localhost:3000
```

### View Logs
```bash
# Monolith
docker logs <container-id>

# Individual containers
docker logs examport-backend
docker logs examport-frontend
docker logs examport-mysql
```

## 🐛 Troubleshooting

### Build Issues

**Problem**: Build fails with "no space left on device"
```bash
docker system prune -a
```

**Problem**: Maven dependencies fail to download
```bash
# Check internet connection
# Try building again - Maven will resume
```

### Runtime Issues

**Problem**: Port already in use
```bash
# Windows
netstat -ano | findstr "3000"

# Linux/Mac
lsof -i :3000
```

**Problem**: Container exits immediately
```bash
# Check logs
docker logs <container-name>

# Run interactively
docker run -it abhijeetrane204/examport-monolith:latest /bin/bash
```

**Problem**: Cannot connect to MySQL
```bash
# Ensure MySQL is ready (wait 30 seconds after start)
# Check DB_URL in environment variables
# Verify network connectivity
```

## 📚 Documentation

- **Quick Start**: `QUICK_START.md`
- **Detailed Guide**: `BUILD_AND_DEPLOY.md`
- **Submission Info**: `SUBMISSION_COMMANDS.md`
- **Checklist**: `DOCKER_CHECKLIST.md`
- **Docker Hub README**: `DOCKER_HUB_README.md`

## 🔐 Security Notes

- Never commit `.env` file with actual credentials
- Use `.env.example` as template
- Keep Docker Hub images public for submission
- Rotate secrets after submission/demo
- Use strong JWT secrets in production

## 📈 Performance Tips

1. **Use multi-stage builds** (already implemented)
2. **Leverage Docker layer caching**
3. **Minimize image size** with Alpine Linux
4. **Use .dockerignore** to exclude unnecessary files
5. **Health checks** for container orchestration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test Docker builds
5. Submit pull request

## 📄 License

[Your License Here]

## 👨‍💻 Author

**Abhijeet Rane**
- Docker Hub: [@abhijeetrane204](https://hub.docker.com/u/abhijeetrane204)
- Email: abhijeetrane204@gmail.com

## 🙏 Acknowledgments

- Spring Boot Team
- React Team
- Docker Community
- MySQL Team

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review troubleshooting section
3. Check Docker logs
4. Contact: abhijeetrane204@gmail.com

---

**Built with ❤️ using Docker, Spring Boot, and React**

🚀 **Ready to deploy? Run `build-all.bat` or `./build-all.sh` now!**

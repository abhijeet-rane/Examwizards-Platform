# 🎓 Examwizards - Online Examination Platform

A comprehensive online examination platform with multi-role support, real-time analytics, and AI-powered features.

## 🐳 Docker Deployment Ready!

This project is fully containerized and ready for Docker deployment.

---

## 🚀 Quick Start

### For Docker Deployment (Recommended)

```bash
# 1. Setup environment
copy .env.example .env
# Edit .env with your credentials

# 2. Build all images (Windows)
build-all.bat

# 2. Build all images (Linux/Mac)
chmod +x build-all.sh
./build-all.sh

# 3. Run the application
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest

# 4. Access the application
# Open: http://localhost:3000
```

**📖 Complete Guide**: See [START_HERE.md](START_HERE.md)

---

## 📦 Docker Images

| Image | Description | Pull Command |
|-------|-------------|--------------|
| **Monolith** | All-in-one (MySQL + Backend + Frontend) | `docker pull abhijeetrane204/examport-monolith:latest` |
| **Backend** | Spring Boot REST API | `docker pull abhijeetrane204/examport-backend:latest` |
| **Frontend** | React SPA with Nginx | `docker pull abhijeetrane204/examport-frontend:latest` |

### Docker Hub Links
- 🏢 [Monolith Image](https://hub.docker.com/r/abhijeetrane204/examport-monolith)
- 🔧 [Backend Image](https://hub.docker.com/r/abhijeetrane204/examport-backend)
- 🎨 [Frontend Image](https://hub.docker.com/r/abhijeetrane204/examport-frontend)

---

## 🎯 Features

- 👥 **Multi-Role System**: Admin, Instructor, Student roles
- 📝 **Exam Management**: Create, edit, and manage exams
- 📊 **Real-Time Analytics**: Live results and statistics
- 💳 **Payment Integration**: Razorpay payment gateway
- 🤖 **AI Chatbot**: Google Gemini powered assistant
- 📧 **Email Notifications**: Automated email system
- 🔐 **JWT Authentication**: Secure authentication & authorization
- 📱 **Responsive Design**: Mobile-friendly interface

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 2.7.18
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Security**: JWT, Spring Security
- **Migration**: Flyway
- **Payment**: Razorpay SDK
- **AI**: Google Gemini API

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Library**: Material-UI
- **State Management**: React Context
- **Routing**: React Router v7

### DevOps
- **Containerization**: Docker
- **Web Server**: Nginx
- **Process Manager**: Supervisor
- **Orchestration**: Docker Compose

---

## 📚 Documentation

### Getting Started
- 📖 [**START_HERE.md**](START_HERE.md) - ⭐ Complete beginner guide
- ⚡ [**QUICK_START.md**](QUICK_START.md) - Quick reference commands

### Deployment
- 🚀 [**BUILD_AND_DEPLOY.md**](BUILD_AND_DEPLOY.md) - Detailed deployment guide
- 🐳 [**README_DOCKER.md**](README_DOCKER.md) - Comprehensive Docker reference
- 📋 [**docker-compose.yml**](docker-compose.yml) - Multi-container setup

### Submission
- 📝 [**SUBMISSION_COMMANDS.md**](SUBMISSION_COMMANDS.md) - ⭐ For project submission
- ✅ [**DOCKER_CHECKLIST.md**](DOCKER_CHECKLIST.md) - Verification checklist

### Architecture
- 🏗️ [**ARCHITECTURE.md**](ARCHITECTURE.md) - System architecture diagrams
- 📚 [**DOCUMENTATION_INDEX.md**](DOCUMENTATION_INDEX.md) - Documentation guide

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

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

---

## 🚀 Deployment Options

### Option 1: Monolith (Easiest)
```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest
```

### Option 2: Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Option 3: Individual Containers
```bash
# MySQL
docker run -d --name examport-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=examwizards -p 3306:3306 mysql:8.0

# Backend
docker run -d --name examport-backend -p 8080:8080 --link examport-mysql:mysql --env-file .env abhijeetrane204/examport-backend:latest

# Frontend
docker run -d --name examport-frontend -p 3000:3000 abhijeetrane204/examport-frontend:latest
```

---

## 📊 Project Structure

```
examport/
├── backend/                 # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                # React frontend
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── Dockerfile              # Monolith image
├── docker-compose.yml      # Multi-container setup
├── .dockerignore
├── .env.example
└── Documentation files
```

---

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
docker logs examport-backend
docker logs examport-frontend
docker logs examport-mysql
```

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clean Docker cache
docker system prune -a

# Check Docker is running
docker info
```

### Runtime Issues
```bash
# Check container logs
docker logs <container-name>

# Check running containers
docker ps -a

# Restart container
docker restart <container-name>
```

**More Help**: See [DOCKER_CHECKLIST.md](DOCKER_CHECKLIST.md) troubleshooting section

---

## 📈 Performance

- **Backend**: ~400MB image, 1-2GB RAM
- **Frontend**: ~50MB image, 512MB RAM
- **MySQL**: ~500MB image, 1GB RAM
- **Monolith**: ~1.5GB image, 3-4GB RAM

---

## 🔐 Security

- JWT-based authentication
- BCrypt password encryption
- Role-based access control (RBAC)
- SQL injection prevention (JPA)
- CORS configuration
- Environment variable secrets

---

## 📄 License

[Your License Here]

---

## 👨‍💻 Author

**Abhijeet Rane**
- Docker Hub: [@abhijeetrane204](https://hub.docker.com/u/abhijeetrane204)
- Email: abhijeetrane204@gmail.com

---

## 🙏 Acknowledgments

- Spring Boot Team
- React Team
- Docker Community
- MySQL Team
- All open-source contributors

---

## 📞 Support

For issues or questions:
1. Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. Review troubleshooting sections
3. Check Docker logs
4. Contact: abhijeetrane204@gmail.com

---

## 🎯 Quick Links

- 🚀 [Get Started](START_HERE.md)
- ⚡ [Quick Commands](QUICK_START.md)
- 📝 [Submission Info](SUBMISSION_COMMANDS.md)
- 🏗️ [Architecture](ARCHITECTURE.md)
- ✅ [Checklist](DOCKER_CHECKLIST.md)

---

**Built with ❤️ using Spring Boot, React, and Docker**

🚀 **Ready to deploy? Run `build-all.bat` or `./build-all.sh` now!**

# ExamPort - Online Examination Platform

ExamPort is a comprehensive online examination platform built with Spring Boot (Backend) and React + TypeScript (Frontend).

## Available Images

### 1. Monolith (All-in-One)
```bash
docker pull abhijeetrane204/examport-monolith:latest
```
Includes: MySQL + Backend + Frontend in a single container

### 2. Backend Only
```bash
docker pull abhijeetrane204/examport-backend:latest
```
Spring Boot REST API with MySQL support

### 3. Frontend Only
```bash
docker pull abhijeetrane204/examport-frontend:latest
```
React + TypeScript SPA with Nginx

## Quick Start

### Option 1: Monolith (Easiest)

```bash
# Create .env file with your credentials
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 \
  --env-file .env \
  abhijeetrane204/examport-monolith:latest
```

Access the application at: http://localhost:3000

### Option 2: Individual Containers

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
  -e DB_URL=jdbc:mysql://mysql:3306/examwizards \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  abhijeetrane204/examport-backend:latest

# Frontend
docker run -d --name examport-frontend \
  -p 3000:3000 \
  abhijeetrane204/examport-frontend:latest
```

## Environment Variables

Required environment variables for backend:

```env
# Database
DB_URL=jdbc:mysql://localhost:3306/examwizards
DB_USERNAME=root
DB_PASSWORD=root

# Email (Gmail SMTP)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=ExamPort <noreply@examport.com>
EMAIL_ENABLED=true
EMAIL_ADMIN=admin@examport.com

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# AI Integration (Google Gemini)
GENAI_API_KEY=your-gemini-api-key

# Security
JWT_SECRET=your-jwt-secret-key
```

## Ports

- **3000**: Frontend (React App)
- **8080**: Backend (Spring Boot API)
- **3306**: MySQL Database

## Features

- 👥 Multi-role system (Admin, Instructor, Student)
- 📝 Exam creation and management
- 📊 Real-time results and analytics
- 💳 Payment integration (Razorpay)
- 🤖 AI-powered chatbot (Google Gemini)
- 📧 Email notifications
- 🔐 JWT authentication
- 📱 Responsive design

## Technology Stack

**Backend:**
- Spring Boot 2.7.18
- Java 17
- MySQL 8.0
- JWT Authentication
- Flyway Migration

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Material-UI

## Docker Compose

For easier deployment, use docker-compose:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: examwizards
    ports:
      - "3306:3306"
  
  backend:
    image: abhijeetrane204/examport-backend:latest
    environment:
      DB_URL: jdbc:mysql://mysql:3306/examwizards
      DB_USERNAME: root
      DB_PASSWORD: root
    ports:
      - "8080:8080"
    depends_on:
      - mysql
  
  frontend:
    image: abhijeetrane204/examport-frontend:latest
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## Health Check

Check if services are running:

```bash
# Backend health
curl http://localhost:8080/api/health

# Frontend
curl http://localhost:3000
```

## Default Credentials

After first run, create admin user using the SQL script provided in the repository.

## Support

For issues and questions:
- GitHub: [Your Repository URL]
- Email: abhijeetrane204@gmail.com

## License

[Your License]

---

**Built with ❤️ by Abhijeet Rane**

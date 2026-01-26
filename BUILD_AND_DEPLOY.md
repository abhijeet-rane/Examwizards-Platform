# ExamPort Docker Build and Deployment Guide

This guide provides step-by-step instructions for building and deploying ExamPort Docker images.

## Prerequisites

- Docker installed and running
- Docker Hub account (username: abhijeetrane204)
- Git repository cloned locally

## Project Structure

```
examport/
├── backend/
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
├── Dockerfile (monolith)
├── docker-compose.yml
├── nginx-monolith.conf
├── supervisord.conf
├── init-mysql.sh
└── .env
```

## 1. Individual Docker Images

### Backend Image

```bash
# Navigate to backend directory
cd backend

# Build the backend image
docker build -t abhijeetrane204/examport-backend:latest .

# Test the backend image locally
docker run -p 8080:8080 \
  -e DB_URL=jdbc:mysql://host.docker.internal:3306/examwizards \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  -e EMAIL_USERNAME=your-email@gmail.com \
  -e EMAIL_PASSWORD=your-app-password \
  -e RAZORPAY_KEY_ID=your-key \
  -e RAZORPAY_KEY_SECRET=your-secret \
  -e JWT_SECRET=your-jwt-secret \
  abhijeetrane204/examport-backend:latest

# Push to Docker Hub
docker push abhijeetrane204/examport-backend:latest
```

### Frontend Image

```bash
# Navigate to frontend directory
cd frontend

# Build the frontend image
docker build -t abhijeetrane204/examport-frontend:latest .

# Test the frontend image locally
docker run -p 3000:3000 abhijeetrane204/examport-frontend:latest

# Push to Docker Hub
docker push abhijeetrane204/examport-frontend:latest
```

## 2. Monolith Docker Image

The monolith image includes MySQL, Backend, and Frontend in a single container.

```bash
# Navigate to project root
cd ..

# Build the monolith image
docker build -t abhijeetrane204/examport-monolith:latest .

# Test the monolith image locally
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 \
  --env-file .env \
  abhijeetrane204/examport-monolith:latest

# Push to Docker Hub
docker push abhijeetrane204/examport-monolith:latest
```

## 3. Using Docker Compose (Recommended)

Docker Compose orchestrates all services together.

```bash
# Create .env file from example
cp .env.example .env

# Edit .env with your actual credentials
# nano .env or use your preferred editor

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 4. Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DB_PASSWORD=root

# Email Configuration
EMAIL_USERNAME=abhijeetrane204@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=ExamPort <noreply@examport.com>
EMAIL_ENABLED=true
EMAIL_ADMIN=abhijeetrane204@gmail.com

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Google Gemini AI
GENAI_API_KEY=your-gemini-api-key

# JWT Secret
JWT_SECRET=your-jwt-secret-key-here
```

## 5. Running the Images

### Option A: Individual Containers

```bash
# Start MySQL
docker run -d --name examport-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=examwizards \
  -p 3306:3306 \
  mysql:8.0

# Start Backend
docker run -d --name examport-backend \
  -p 8080:8080 \
  --link examport-mysql:mysql \
  --env-file .env \
  abhijeetrane204/examport-backend:latest

# Start Frontend
docker run -d --name examport-frontend \
  -p 3000:3000 \
  abhijeetrane204/examport-frontend:latest
```

### Option B: Monolith Container

```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 \
  --env-file .env \
  abhijeetrane204/examport-monolith:latest
```

### Option C: Docker Compose (Best)

```bash
docker-compose up -d
```

## 6. Accessing the Application

After starting the containers:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MySQL**: localhost:3306

## 7. Docker Hub Links

Your images will be available at:

- **Monolith**: https://hub.docker.com/r/abhijeetrane204/examport-monolith
- **Frontend**: https://hub.docker.com/r/abhijeetrane204/examport-frontend
- **Backend**: https://hub.docker.com/r/abhijeetrane204/examport-backend

## 8. Complete Build Script

Create a file `build-all.sh`:

```bash
#!/bin/bash

# Login to Docker Hub
docker login

# Build Backend
echo "Building Backend..."
cd backend
docker build -t abhijeetrane204/examport-backend:latest .
docker push abhijeetrane204/examport-backend:latest
cd ..

# Build Frontend
echo "Building Frontend..."
cd frontend
docker build -t abhijeetrane204/examport-frontend:latest .
docker push abhijeetrane204/examport-frontend:latest
cd ..

# Build Monolith
echo "Building Monolith..."
docker build -t abhijeetrane204/examport-monolith:latest .
docker push abhijeetrane204/examport-monolith:latest

echo "All images built and pushed successfully!"
```

Make it executable:
```bash
chmod +x build-all.sh
./build-all.sh
```

## 9. Troubleshooting

### Check container logs
```bash
docker logs examport-backend
docker logs examport-frontend
docker logs examport-mysql
```

### Check container status
```bash
docker ps -a
```

### Restart a container
```bash
docker restart examport-backend
```

### Remove all containers and start fresh
```bash
docker-compose down -v
docker-compose up -d
```

## 10. Production Deployment

For production, consider:

1. Use specific version tags instead of `latest`
2. Set up proper secrets management
3. Configure SSL/TLS certificates
4. Set up database backups
5. Use orchestration tools like Kubernetes
6. Implement monitoring and logging

## 11. Submission Format

For your submission, provide:

```bash
# Individual Images
docker pull abhijeetrane204/examport-backend:latest
docker pull abhijeetrane204/examport-frontend:latest

# Monolith Image
docker pull abhijeetrane204/examport-monolith:latest

# Run Monolith
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 \
  --env-file .env \
  abhijeetrane204/examport-monolith:latest
```

## Support

For issues or questions, check the logs and ensure all environment variables are properly configured.

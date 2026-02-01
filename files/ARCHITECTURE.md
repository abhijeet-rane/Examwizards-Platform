# ExamPort Docker Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ExamPort System                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Deployment Options                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Option 1: Monolith Container                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │ Frontend │  │ Backend  │  │  MySQL   │            │    │
│  │  │  :3000   │  │  :8080   │  │  :3306   │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  │         Single Container (Monolith)                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Option 2: Separate Containers                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ Frontend │  │ Backend  │  │  MySQL   │                     │
│  │Container │  │Container │  │Container │                     │
│  │  :3000   │  │  :8080   │  │  :3306   │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│       │              │              │                           │
│       └──────────────┴──────────────┘                           │
│              Docker Network                                      │
│                                                                  │
│  Option 3: Docker Compose                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Docker Compose Orchestration                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │ Frontend │  │ Backend  │  │  MySQL   │            │    │
│  │  │ Service  │  │ Service  │  │ Service  │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  │         Automatic Networking & Volumes                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Landing    │  │    Auth      │  │  Dashboard   │         │
│  │     Page     │  │    Pages     │  │    Pages     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Exam      │  │   Results    │  │   Profile    │         │
│  │  Interface   │  │    Pages     │  │    Pages     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Nginx Server (Port 3000)                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Spring Boot 2.7.18 + Java 17                                   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Controllers                           │   │
│  │  Auth │ User │ Course │ Exam │ Payment │ Review        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Services                             │   │
│  │  AuthService │ EnrollmentService │ PaymentService       │   │
│  │  EmailService │ ValidationService │ StatisticsService   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Repositories                           │   │
│  │  UserRepo │ CourseRepo │ ExamRepo │ ResultRepo          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Security                              │   │
│  │  JWT Filter │ Security Config │ JWT Util                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Spring Boot Server (Port 8080)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JDBC
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  MySQL 8.0                                                       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Users   │  │ Courses  │  │  Exams   │  │ Results  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Questions │  │Enrollment│  │ Reviews  │  │ Payments │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  MySQL Server (Port 3306)                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Docker Image Build Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Image Build                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stage 1: Build                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  maven:3.9.6-eclipse-temurin-17                        │    │
│  │  1. Copy pom.xml                                       │    │
│  │  2. Download dependencies                              │    │
│  │  3. Copy source code                                   │    │
│  │  4. Build JAR (mvn clean package)                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  Stage 2: Runtime                                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  eclipse-temurin:17-jre-alpine                         │    │
│  │  1. Copy JAR from build stage                          │    │
│  │  2. Expose port 8080                                   │    │
│  │  3. Set entrypoint: java -jar app.jar                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│              abhijeetrane204/examport-backend:latest            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Image Build                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stage 1: Build                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  node:20-alpine                                        │    │
│  │  1. Copy package.json                                  │    │
│  │  2. Install dependencies (npm ci)                      │    │
│  │  3. Copy source code                                   │    │
│  │  4. Build production bundle (npm run build)            │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  Stage 2: Runtime                                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  nginx:alpine                                          │    │
│  │  1. Copy build files from build stage                  │    │
│  │  2. Copy nginx configuration                           │    │
│  │  3. Expose port 3000                                   │    │
│  │  4. Start nginx                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│              abhijeetrane204/examport-frontend:latest           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Monolith Image Build                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stage 1: MySQL Base                                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  mysql:8.0                                             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Stage 2: Backend Build                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  maven:3.9.6-eclipse-temurin-17                        │    │
│  │  Build backend JAR                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Stage 3: Frontend Build                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  node:20-alpine                                        │    │
│  │  Build frontend bundle                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Stage 4: Final Assembly                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ubuntu:22.04                                          │    │
│  │  1. Install: Java 17, Nginx, MySQL, Supervisor        │    │
│  │  2. Copy backend JAR                                   │    │
│  │  3. Copy frontend build                                │    │
│  │  4. Configure Nginx                                    │    │
│  │  5. Configure Supervisor                               │    │
│  │  6. Expose ports: 3000, 8080, 3306                     │    │
│  │  7. Start Supervisor (manages all services)            │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│              abhijeetrane204/examport-monolith:latest           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTP Request (Port 3000)
       ▼
┌─────────────────────────────────┐
│         Nginx (Frontend)        │
│  - Serves React SPA             │
│  - Routes /api/* to backend     │
└──────┬──────────────────────────┘
       │
       │ API Request (/api/*)
       ▼
┌─────────────────────────────────┐
│    Spring Boot (Backend)        │
│  - JWT Authentication           │
│  - Business Logic               │
│  - Data Validation              │
└──────┬──────────────────────────┘
       │
       │ SQL Queries
       ▼
┌─────────────────────────────────┐
│         MySQL Database          │
│  - User Data                    │
│  - Exam Data                    │
│  - Results                      │
└─────────────────────────────────┘
```

## External Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│                    ExamPort Backend                              │
└────┬────────────┬────────────┬────────────┬─────────────────────┘
     │            │            │            │
     │            │            │            │
     ▼            ▼            ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  Gmail  │  │Razorpay │  │ Google  │  │  MySQL  │
│  SMTP   │  │ Payment │  │ Gemini  │  │Database │
│         │  │ Gateway │  │   AI    │  │         │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
   Email       Payments     Chatbot      Storage
Notifications  Processing   Assistant
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Network Security                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  - Docker Network Isolation                            │    │
│  │  - Port Exposure Control                               │    │
│  │  - CORS Configuration                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 2: Application Security                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  - JWT Authentication                                  │    │
│  │  - Role-Based Access Control (RBAC)                    │    │
│  │  - Password Encryption (BCrypt)                        │    │
│  │  - Input Validation                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Layer 3: Data Security                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  - Database Access Control                             │    │
│  │  - SQL Injection Prevention (JPA)                      │    │
│  │  - Environment Variable Secrets                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Development Workflow                          │
└─────────────────────────────────────────────────────────────────┘

1. Code Development
   ├── Backend (Spring Boot)
   └── Frontend (React + TypeScript)
          │
          ▼
2. Build Docker Images
   ├── docker build backend
   ├── docker build frontend
   └── docker build monolith
          │
          ▼
3. Test Locally
   └── docker run / docker-compose up
          │
          ▼
4. Push to Docker Hub
   ├── docker push backend:latest
   ├── docker push frontend:latest
   └── docker push monolith:latest
          │
          ▼
5. Deploy to Production
   └── docker pull & docker run
          │
          ▼
6. Monitor & Maintain
   ├── Check logs
   ├── Monitor performance
   └── Update as needed
```

## Resource Requirements

```
┌─────────────────────────────────────────────────────────────────┐
│                    Resource Allocation                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend Container                                             │
│  ├── CPU: 0.5 cores                                             │
│  ├── Memory: 512 MB                                             │
│  └── Disk: 100 MB                                               │
│                                                                  │
│  Backend Container                                              │
│  ├── CPU: 1-2 cores                                             │
│  ├── Memory: 1-2 GB                                             │
│  └── Disk: 500 MB                                               │
│                                                                  │
│  MySQL Container                                                │
│  ├── CPU: 1 core                                                │
│  ├── Memory: 1 GB                                               │
│  └── Disk: 2-5 GB (data volume)                                 │
│                                                                  │
│  Monolith Container                                             │
│  ├── CPU: 2-3 cores                                             │
│  ├── Memory: 3-4 GB                                             │
│  └── Disk: 3-6 GB                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Horizontal Scaling                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Load Balancer                                                  │
│       │                                                          │
│       ├──────┬──────┬──────┬──────┐                            │
│       ▼      ▼      ▼      ▼      ▼                            │
│   Frontend Frontend Frontend ...                                │
│   Instance Instance Instance                                    │
│       │      │      │                                           │
│       └──────┴──────┴──────┐                                    │
│                             │                                    │
│       ┌─────────────────────┘                                   │
│       │                                                          │
│       ├──────┬──────┬──────┬──────┐                            │
│       ▼      ▼      ▼      ▼      ▼                            │
│   Backend Backend Backend ...                                   │
│   Instance Instance Instance                                    │
│       │      │      │                                           │
│       └──────┴──────┴──────┐                                    │
│                             │                                    │
│                             ▼                                    │
│                      MySQL Cluster                              │
│                   (Master-Slave Replication)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

This architecture provides a scalable, secure, and maintainable deployment solution for ExamPort.

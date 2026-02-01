# Monolith Dockerfile for ExamPort (Frontend + Backend + MySQL)
FROM mysql:8.0 AS mysql-base

# Backend build stage
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Final monolith stage
FROM ubuntu:22.04

# Install required packages
RUN apt-get update && apt-get install -y \
    openjdk-17-jre \
    nginx \
    mysql-server \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create application directories
RUN mkdir -p /app/backend /app/frontend /app/logs /var/log/supervisor

# Copy backend jar
COPY --from=backend-build /app/backend/target/*.jar /app/backend/app.jar

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /app/frontend

# Copy nginx configuration
COPY nginx-monolith.conf /etc/nginx/sites-available/default

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy MySQL initialization script
COPY init-mysql.sh /docker-entrypoint-initdb.d/

# Expose ports
EXPOSE 3000 8080 3306

# Set environment variables for MySQL
ENV MYSQL_ROOT_PASSWORD=root \
    MYSQL_DATABASE=examwizards

# Set application environment variables (with defaults)
ENV DB_URL=jdbc:mysql://localhost:3306/examwizards \
    DB_USERNAME=root \
    DB_PASSWORD=root \
    EMAIL_USERNAME=abhijeetrane204@gmail.com \
    EMAIL_PASSWORD=afgrhlbssxrwgwqz \
    EMAIL_FROM="ExamWizards <noreply@examwizards.com>" \
    EMAIL_ENABLED=true \
    EMAIL_ADMIN=abhijeetrane204@gmail.com \
    RAZORPAY_KEY_ID=rzp_test_8aUQmru5Kk5M0H \
    RAZORPAY_KEY_SECRET=vsqBJcTH5XuRF2f9Ti9DoJHJ \
    GENAI_API_KEY=AIzaSyCZtpoHsn_agVg7rfW_VUXtaqWrOk4l4Ro \
    JWT_SECRET=examport-secret-key-2024 \
    FRONTEND_URL=http://localhost:5173 \
    API_BASE_URL=http://localhost:8080/api \
    SERVER_PORT=8080 \
    NODE_ENV=production

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

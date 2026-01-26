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

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=examwizards

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Backend Dockerfile for ExamPort
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8080

# Set default environment variables (can be overridden at runtime)
ENV SPRING_PROFILES_ACTIVE=prod \
    DB_URL=jdbc:mysql://localhost:3306/examwizards \
    DB_USERNAME=root \
    DB_PASSWORD=root \
    EMAIL_USERNAME=abhijeetrane204@gmail.com \
    EMAIL_PASSWORD=afgrhlbssxrwgwqz \
    EMAIL_FROM="ExamPort <noreply@examport.com>" \
    EMAIL_ENABLED=true \
    EMAIL_ADMIN=abhijeetrane204@gmail.com \
    RAZORPAY_KEY_ID=rzp_test_8aUQmru5Kk5M0H \
    RAZORPAY_KEY_SECRET=vsqBJcTH5XuRF2f9Ti9DoJHJ \
    GENAI_API_KEY=AIzaSyCZtpoHsn_agVg7rfW_VUXtaqWrOk4l4Ro \
    JWT_SECRET=examport-secret-key-2024 \
    FRONTEND_URL=http://localhost:5173 \
    SERVER_PORT=8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

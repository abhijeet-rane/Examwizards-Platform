#!/bin/bash
set -e

# Start nginx in the background to serve frontend
nginx

# Start the Spring Boot backend
exec java -jar /app/backend/app.jar

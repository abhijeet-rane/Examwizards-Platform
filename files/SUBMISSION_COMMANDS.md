# ExamPort Docker Submission Commands

## Your Docker Hub Username
```
abhijeetrane204
```

## Docker Hub Image Links

After building and pushing, your images will be available at:

1. **Monolith**: https://hub.docker.com/r/abhijeetrane204/examport-monolith
2. **Frontend**: https://hub.docker.com/r/abhijeetrane204/examport-frontend
3. **Backend**: https://hub.docker.com/r/abhijeetrane204/examport-backend

## Build Commands (Run These First)

### Windows (CMD/PowerShell):
```cmd
build-all.bat
```

### Linux/Mac:
```bash
chmod +x build-all.sh
./build-all.sh
```

### Manual Build (if script doesn't work):

```bash
# Login to Docker Hub
docker login

# Build and push backend
cd backend
docker build -t abhijeetrane204/examport-backend:latest .
docker push abhijeetrane204/examport-backend:latest
cd ..

# Build and push frontend
cd frontend
docker build -t abhijeetrane204/examport-frontend:latest .
docker push abhijeetrane204/examport-frontend:latest
cd ..

# Build and push monolith
docker build -t abhijeetrane204/examport-monolith:latest .
docker push abhijeetrane204/examport-monolith:latest
```

## Pull Commands (For Submission)

```bash
# Pull all images
docker pull abhijeetrane204/examport-backend:latest
docker pull abhijeetrane204/examport-frontend:latest
docker pull abhijeetrane204/examport-monolith:latest
```

## Run Commands (For Submission)

### Monolith (Single Container - Recommended for Demo)

**Simple Command (Works Anywhere - No .env file needed):**
```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 abhijeetrane204/examport-monolith:latest
```

**With Custom Environment Variables (Optional):**
```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 \
  -e DB_PASSWORD=your-password \
  -e EMAIL_USERNAME=your-email@gmail.com \
  abhijeetrane204/examport-monolith:latest
```

**If Port 3306 is Already in Use:**
```bash
# Skip MySQL port exposure (MySQL still works inside container)
docker run -p 3000:3000 -p 8080:8080 abhijeetrane204/examport-monolith:latest
```

**Using Run Script:**
```bash
# Windows
run-monolith.bat

# Linux/Mac
chmod +x run-monolith.sh
./run-monolith.sh
```

### Individual Containers

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
  -e DB_URL=jdbc:mysql://mysql:3306/examwizards \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  -e EMAIL_USERNAME=abhijeetrane204@gmail.com \
  -e EMAIL_PASSWORD=your-app-password \
  -e RAZORPAY_KEY_ID=your-key \
  -e RAZORPAY_KEY_SECRET=your-secret \
  -e JWT_SECRET=your-jwt-secret \
  abhijeetrane204/examport-backend:latest

# Start Frontend
docker run -d --name examport-frontend \
  -p 3000:3000 \
  abhijeetrane204/examport-frontend:latest
```

### Docker Compose (Best for Development)

```bash
# Create .env file first
cp .env.example .env

# Edit .env with your credentials
# Then run:
docker-compose up -d

# To stop:
docker-compose down
```

## Access URLs

After running the containers:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **MySQL**: localhost:3306

## Submission Format

Provide this in your submission document:

```
Docker Hub Username: abhijeetrane204

Docker Images:
1. Monolith: abhijeetrane204/examport-monolith:latest
2. Frontend: abhijeetrane204/examport-frontend:latest
3. Backend: abhijeetrane204/examport-backend:latest

Pull Command:
docker pull abhijeetrane204/examport-monolith:latest

Run Command:
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 --env-file .env abhijeetrane204/examport-monolith:latest

Access URL:
http://localhost:3000
```

## Environment File (.env)

Create a `.env` file in the project root with:

```env
# Database
DB_PASSWORD=root

# Email Configuration
EMAIL_USERNAME=abhijeetrane204@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=ExamPort <noreply@examport.com>
EMAIL_ENABLED=true
EMAIL_ADMIN=abhijeetrane204@gmail.com

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Google Gemini AI
GENAI_API_KEY=your-gemini-api-key

# JWT
JWT_SECRET=your-jwt-secret-key-here
```

## Verification Steps

1. **Build all images**: Run `build-all.bat` or `build-all.sh`
2. **Verify images exist**: `docker images | grep examport`
3. **Push to Docker Hub**: Images should be pushed automatically by script
4. **Test pull**: `docker pull abhijeetrane204/examport-monolith:latest`
5. **Test run**: Use the run command above
6. **Access application**: Open http://localhost:3000

## Troubleshooting

### Build Issues
```bash
# Check Docker is running
docker --version
docker info

# Clean build cache
docker system prune -a
```

### Push Issues
```bash
# Login again
docker login

# Check image names
docker images
```

### Run Issues
```bash
# Check if ports are available
netstat -an | findstr "3000 8080 3306"

# Check container logs
docker logs examport-backend
docker logs examport-frontend
```

## Notes for Evaluator

- All three image types are provided (monolith, frontend, backend)
- Monolith image is recommended for easy testing
- Environment variables can be passed via .env file
- Application includes MySQL, Spring Boot backend, and React frontend
- Default ports: 3000 (frontend), 8080 (backend), 3306 (database)

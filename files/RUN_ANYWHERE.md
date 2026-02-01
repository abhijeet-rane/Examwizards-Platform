# 🌍 Run ExamPort Anywhere - Universal Docker Commands

## Problem
The `.env` file is only on your local machine. Other systems won't have it.

## Solutions

### Solution 1: Inline Environment Variables (Recommended for Submission)

```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 \
  -e DB_URL=jdbc:mysql://localhost:3306/examwizards \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  -e EMAIL_USERNAME=abhijeetrane204@gmail.com \
  -e EMAIL_PASSWORD=afgrhlbssxrwgwqz \
  -e EMAIL_FROM="ExamPort <noreply@examport.com>" \
  -e EMAIL_ENABLED=true \
  -e EMAIL_ADMIN=abhijeetrane204@gmail.com \
  -e RAZORPAY_KEY_ID=rzp_test_8aUQmru5Kk5M0H \
  -e RAZORPAY_KEY_SECRET=vsqBJcTH5XuRF2f9Ti9DoJHJ \
  -e GENAI_API_KEY=AIzaSyCZtpoHsn_agVg7rfW_VUXtaqWrOk4l4Ro \
  -e JWT_SECRET=your-jwt-secret-key-here \
  -e FRONTEND_URL=http://localhost:5173 \
  -e SERVER_PORT=8080 \
  abhijeetrane204/examport-monolith:latest
```

**Windows (PowerShell):**
```powershell
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 `
  -e DB_URL=jdbc:mysql://localhost:3306/examwizards `
  -e DB_USERNAME=root `
  -e DB_PASSWORD=root `
  -e EMAIL_USERNAME=abhijeetrane204@gmail.com `
  -e EMAIL_PASSWORD=afgrhlbssxrwgwqz `
  -e EMAIL_FROM="ExamPort <noreply@examport.com>" `
  -e EMAIL_ENABLED=true `
  -e EMAIL_ADMIN=abhijeetrane204@gmail.com `
  -e RAZORPAY_KEY_ID=rzp_test_8aUQmru5Kk5M0H `
  -e RAZORPAY_KEY_SECRET=vsqBJcTH5XuRF2f9Ti9DoJHJ `
  -e GENAI_API_KEY=AIzaSyCZtpoHsn_agVg7rfW_VUXtaqWrOk4l4Ro `
  -e JWT_SECRET=your-jwt-secret-key-here `
  -e FRONTEND_URL=http://localhost:5173 `
  -e SERVER_PORT=8080 `
  abhijeetrane204/examport-monolith:latest
```

### Solution 2: Bake Environment Variables into Image (Most Portable)

Create a new Dockerfile that includes default values:

**Dockerfile.production**
```dockerfile
FROM abhijeetrane204/examport-monolith:latest

# Set default environment variables
ENV DB_URL=jdbc:mysql://localhost:3306/examwizards
ENV DB_USERNAME=root
ENV DB_PASSWORD=root
ENV EMAIL_USERNAME=abhijeetrane204@gmail.com
ENV EMAIL_PASSWORD=afgrhlbssxrwgwqz
ENV EMAIL_FROM="ExamPort <noreply@examport.com>"
ENV EMAIL_ENABLED=true
ENV EMAIL_ADMIN=abhijeetrane204@gmail.com
ENV RAZORPAY_KEY_ID=rzp_test_8aUQmru5Kk5M0H
ENV RAZORPAY_KEY_SECRET=vsqBJcTH5XuRF2f9Ti9DoJHJ
ENV GENAI_API_KEY=AIzaSyCZtpoHsn_agVg7rfW_VUXtaqWrOk4l4Ro
ENV JWT_SECRET=your-jwt-secret-key-here
ENV FRONTEND_URL=http://localhost:5173
ENV SERVER_PORT=8080
```

Build and push:
```bash
docker build -f Dockerfile.production -t abhijeetrane204/examport-monolith:production .
docker push abhijeetrane204/examport-monolith:production
```

Then anyone can run:
```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 abhijeetrane204/examport-monolith:production
```

### Solution 3: Simple Run Command (No External Dependencies)

If you rebuild the monolith with ENV variables in the Dockerfile:

```bash
# Anyone, anywhere can run this single command
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 abhijeetrane204/examport-monolith:latest
```

## For Submission - Recommended Approach

### Option A: Provide Complete Command (Easiest for Evaluator)

```bash
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 \
  -e DB_PASSWORD=root \
  -e EMAIL_USERNAME=abhijeetrane204@gmail.com \
  -e EMAIL_PASSWORD=afgrhlbssxrwgwqz \
  -e RAZORPAY_KEY_ID=rzp_test_8aUQmru5Kk5M0H \
  -e RAZORPAY_KEY_SECRET=vsqBJcTH5XuRF2f9Ti9DoJHJ \
  -e GENAI_API_KEY=AIzaSyCZtpoHsn_agVg7rfW_VUXtaqWrOk4l4Ro \
  -e JWT_SECRET=examport-secret-2024 \
  abhijeetrane204/examport-monolith:latest
```

### Option B: Create Production Image with Defaults

This is the BEST approach for submission:

1. Update your Dockerfile to include default ENV values
2. Rebuild and push
3. Provide simple run command

## Implementation Steps

### Step 1: Update Monolith Dockerfile

Add ENV variables before CMD:
```dockerfile
# ... existing Dockerfile content ...

# Set default environment variables
ENV DB_URL=jdbc:mysql://localhost:3306/examwizards \
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
    JWT_SECRET=examport-secret-2024 \
    FRONTEND_URL=http://localhost:5173 \
    SERVER_PORT=8080

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

### Step 2: Rebuild and Push

```bash
docker build -t abhijeetrane204/examport-monolith:latest .
docker push abhijeetrane204/examport-monolith:latest
```

### Step 3: Test on Any System

```bash
# This will work anywhere!
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 abhijeetrane204/examport-monolith:latest
```

## Handling Port Conflicts

If port 3306 is in use on the evaluator's system:

```bash
# Use different external port for MySQL
docker run -p 3000:3000 -p 8080:8080 -p 3307:3306 abhijeetrane204/examport-monolith:latest
```

Or skip MySQL port exposure:
```bash
# MySQL only accessible inside container
docker run -p 3000:3000 -p 8080:8080 abhijeetrane204/examport-monolith:latest
```

## Security Note

⚠️ **Warning**: Embedding credentials in Docker images is NOT recommended for production!

For submission/demo purposes, this is acceptable. For production:
- Use Docker secrets
- Use environment variable injection at runtime
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)

## Submission Format

Provide this in your submission:

```
Docker Hub Username: abhijeetrane204
Image: abhijeetrane204/examport-monolith:latest

Run Command (Works Anywhere):
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 abhijeetrane204/examport-monolith:latest

Alternative (if port 3306 is in use):
docker run -p 3000:3000 -p 8080:8080 abhijeetrane204/examport-monolith:latest

Access: http://localhost:3000

Note: All environment variables are pre-configured in the image.
No additional setup required.
```

## Testing on Different Systems

### Test 1: Fresh System
```bash
docker pull abhijeetrane204/examport-monolith:latest
docker run -p 3000:3000 -p 8080:8080 -p 3306:3306 abhijeetrane204/examport-monolith:latest
```

### Test 2: Different Ports
```bash
docker run -p 8000:3000 -p 9000:8080 -p 3307:3306 abhijeetrane204/examport-monolith:latest
# Access at: http://localhost:8000
```

### Test 3: Background Mode
```bash
docker run -d -p 3000:3000 -p 8080:8080 -p 3306:3306 --name examport abhijeetrane204/examport-monolith:latest
```

## Verification

After running, verify:
1. Frontend: http://localhost:3000
2. Backend API: http://localhost:8080/api
3. Check logs: `docker logs <container-id>`

## Summary

**Best for Submission**: Update Dockerfile with ENV variables, rebuild, and provide simple run command.

**Quickest Solution**: Provide inline environment variables in the run command.

Choose based on your preference!

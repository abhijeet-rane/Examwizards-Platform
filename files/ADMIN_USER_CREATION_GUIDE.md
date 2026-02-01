# 🔐 Admin User Creation Guide

## Overview

For security reasons, admin users cannot be created through the public registration form. Admin accounts must be created directly through the database to prevent unauthorized access to administrative functions.

## 🚨 Security Implementation

### Frontend Security
- ✅ Admin option removed from registration form
- ✅ TypeScript interface updated to exclude admin role
- ✅ Only Student and Instructor roles available for public registration

### Backend Security
- ✅ Role validation added to registration endpoint
- ✅ Admin registration attempts are blocked with error message
- ✅ Only 'student' and 'instructor' roles allowed for public registration

## 📋 Creating Admin Users

### Method 1: Direct Database Insert (Recommended)

#### Step 1: Generate Password Hash
First, generate a BCrypt hash for the admin password:

```java
// Java code to generate password hash
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hashedPassword = encoder.encode("your_admin_password");
System.out.println(hashedPassword);
```

Or use an online BCrypt generator with cost factor 10.

#### Step 2: Insert Admin User
```sql
-- Replace values with actual admin details
INSERT INTO users (
    username, 
    email, 
    password, 
    full_name, 
    role, 
    phone_number, 
    gender, 
    is_email_verified, 
    created_at, 
    updated_at
) VALUES (
    'admin',                                    -- username
    'admin@examwizards.com',                   -- email
    '$2a$10$your_bcrypt_hashed_password_here', -- password (BCrypt hash)
    'System Administrator',                     -- full_name
    'admin',                                   -- role
    '1234567890',                             -- phone_number
    'Other',                                  -- gender
    true,                                     -- is_email_verified
    NOW(),                                    -- created_at
    NOW()                                     -- updated_at
);
```

#### Example with Real Values:
```sql
-- Example admin user creation
INSERT INTO users (
    username, 
    email, 
    password, 
    full_name, 
    role, 
    phone_number, 
    gender, 
    is_email_verified, 
    created_at, 
    updated_at
) VALUES (
    'admin',
    'admin@examwizards.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZJUn/3NNVnQxpCI6XQ6zM6FfVlBG', -- password: admin123
    'System Administrator',
    'admin',
    '9999999999',
    'Other',
    true,
    NOW(),
    NOW()
);
```

### Method 2: Using Spring Boot Application

Create a one-time admin creation service:

```java
@Component
public class AdminUserCreator {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @PostConstruct
    public void createDefaultAdmin() {
        // Check if admin already exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@examwizards.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Change this password!
            admin.setFullName("System Administrator");
            admin.setRole("admin");
            admin.setPhoneNumber("9999999999");
            admin.setGender("Other");
            admin.setEmailVerified(true);
            
            userRepository.save(admin);
            System.out.println("Default admin user created successfully!");
        }
    }
}
```

### Method 3: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Use the examwizards database
USE examwizards;

# Create admin user
INSERT INTO users (username, email, password, full_name, role, phone_number, gender, is_email_verified, created_at, updated_at) 
VALUES ('admin', 'admin@examwizards.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZJUn/3NNVnQxpCI6XQ6zM6FfVlBG', 'System Administrator', 'admin', '9999999999', 'Other', true, NOW(), NOW());

# Verify admin user creation
SELECT id, username, email, role, is_email_verified FROM users WHERE role = 'admin';
```

## 🔑 Default Admin Credentials

After creating the admin user using the examples above:

- **Username**: `admin`
- **Email**: `admin@examwizards.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## 🛡️ Security Best Practices

### 1. Strong Password Policy
- Use strong, unique passwords for admin accounts
- Minimum 12 characters with mixed case, numbers, and symbols
- Avoid common passwords or dictionary words

### 2. Email Verification
- Set `is_email_verified = true` for admin accounts
- Use a valid email address for admin communications

### 3. Limited Admin Accounts
- Create only necessary admin accounts
- Use principle of least privilege
- Regular audit of admin accounts

### 4. Account Monitoring
- Monitor admin account login activities
- Set up alerts for admin account usage
- Regular password rotation

## 📊 Verifying Admin Creation

### Check Admin User in Database
```sql
-- Verify admin user exists
SELECT 
    id, 
    username, 
    email, 
    role, 
    full_name, 
    is_email_verified, 
    created_at 
FROM users 
WHERE role = 'admin';
```

### Test Admin Login
1. Go to the login page
2. Use admin credentials
3. Verify redirect to admin dashboard
4. Check admin-specific features are accessible

## 🔧 Troubleshooting

### Common Issues

#### 1. Password Hash Issues
```sql
-- If password doesn't work, regenerate hash
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZJUn/3NNVnQxpCI6XQ6zM6FfVlBG' 
WHERE username = 'admin';
```

#### 2. Email Verification Issues
```sql
-- Ensure email is verified
UPDATE users 
SET is_email_verified = true 
WHERE username = 'admin';
```

#### 3. Role Case Sensitivity
```sql
-- Ensure role is lowercase
UPDATE users 
SET role = 'admin' 
WHERE username = 'admin';
```

## 🚀 Production Deployment

### Environment-Specific Admin Creation

#### Development Environment
```sql
INSERT INTO users (username, email, password, full_name, role, phone_number, gender, is_email_verified, created_at, updated_at) 
VALUES ('dev-admin', 'dev-admin@examwizards.com', '$2a$10$hashed_password', 'Development Admin', 'admin', '1111111111', 'Other', true, NOW(), NOW());
```

#### Staging Environment
```sql
INSERT INTO users (username, email, password, full_name, role, phone_number, gender, is_email_verified, created_at, updated_at) 
VALUES ('staging-admin', 'staging-admin@examwizards.com', '$2a$10$hashed_password', 'Staging Admin', 'admin', '2222222222', 'Other', true, NOW(), NOW());
```

#### Production Environment
```sql
INSERT INTO users (username, email, password, full_name, role, phone_number, gender, is_email_verified, created_at, updated_at) 
VALUES ('prod-admin', 'admin@yourdomain.com', '$2a$10$strong_hashed_password', 'Production Admin', 'admin', 'real_phone_number', 'Other', true, NOW(), NOW());
```

## 📝 Admin Account Management

### Creating Multiple Admin Users
```sql
-- Create additional admin users as needed
INSERT INTO users (username, email, password, full_name, role, phone_number, gender, is_email_verified, created_at, updated_at) 
VALUES 
('admin1', 'admin1@examwizards.com', '$2a$10$hash1', 'Admin One', 'admin', '3333333333', 'Male', true, NOW(), NOW()),
('admin2', 'admin2@examwizards.com', '$2a$10$hash2', 'Admin Two', 'admin', '4444444444', 'Female', true, NOW(), NOW());
```

### Deactivating Admin Users
```sql
-- Soft delete by changing role (recommended)
UPDATE users SET role = 'deactivated' WHERE username = 'old-admin';

-- Or hard delete (use with caution)
DELETE FROM users WHERE username = 'old-admin';
```

## 🔍 Monitoring and Auditing

### Admin Activity Logging
Consider implementing admin activity logging:

```sql
-- Create admin activity log table
CREATE TABLE admin_activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);
```

### Regular Admin Audit
```sql
-- List all admin users
SELECT 
    id, 
    username, 
    email, 
    full_name, 
    created_at, 
    updated_at,
    is_email_verified
FROM users 
WHERE role = 'admin' 
ORDER BY created_at DESC;
```

---

## ⚠️ Important Security Notes

1. **Never commit admin credentials** to version control
2. **Use environment-specific admin accounts** for different deployments
3. **Regularly rotate admin passwords**
4. **Monitor admin account activities**
5. **Use strong, unique passwords** for each admin account
6. **Enable two-factor authentication** if implemented
7. **Limit the number of admin accounts** to necessary personnel only

---

**Remember**: Admin accounts have full system access. Create them responsibly and secure them properly!
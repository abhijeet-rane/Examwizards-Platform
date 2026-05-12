-- =============================================================================
-- ExamWizards full schema for MySQL 8 / Azure Database for MySQL (InnoDB).
-- Aligns with Spring Boot JPA entities (snake_case columns, table names as used by Hibernate).
--
-- Usage (after selecting your database):
--   mysql -h ... -u ... -p examwizards < examwizards_full_schema_mysql8.sql
--
-- Or in Azure Query Editor / Workbench:
--   USE examwizards;
--   then paste and execute.
--
-- After applying, set the backend to stop auto-DDL if you want no Hibernate changes:
--   spring.jpa.hibernate.ddl-auto=validate   (or none)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Drop in dependency order (children first)
DROP TABLE IF EXISTS question_correct_options;
DROP TABLE IF EXISTS exam_option;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS result;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS exam;
DROP TABLE IF EXISTS course_allowed_emails;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS verification_tokens;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS contact_message;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NULL,
    phone_number VARCHAR(10) NULL,
    avatar_url VARCHAR(255) NULL,
    gender VARCHAR(10) NULL,
    email_verified BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email),
    KEY idx_users_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- verification_tokens
-- -----------------------------------------------------------------------------
CREATE TABLE verification_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    expiry_time DATETIME(6) NOT NULL,
    token_type VARCHAR(255) NOT NULL,
    used BIT(1) NOT NULL DEFAULT b'0',
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_verification_tokens_token (token),
    KEY idx_verification_tokens_user (user_id),
    CONSTRAINT fk_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- reviews
-- -----------------------------------------------------------------------------
CREATE TABLE reviews (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    is_approved BIT(1) NOT NULL DEFAULT b'1',
    is_active BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (id),
    KEY idx_reviews_user (user_id),
    KEY idx_reviews_approved (is_approved),
    KEY idx_reviews_active (is_active),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- contact_message  (@Enumerated STRING: PENDING, IN_PROGRESS, REPLIED)
-- -----------------------------------------------------------------------------
CREATE TABLE contact_message (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    submitted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
    admin_response TEXT NULL,
    reference_number VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_contact_message_reference (reference_number),
    KEY idx_contact_message_email (email),
    KEY idx_contact_message_status (status),
    KEY idx_contact_message_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- courses
-- -----------------------------------------------------------------------------
CREATE TABLE courses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    instructor_id BIGINT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'PRIVATE',
    pricing VARCHAR(50) NOT NULL DEFAULT 'FREE',
    price DECIMAL(10, 2) NULL,
    description TEXT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_courses_name (name),
    KEY idx_courses_instructor (instructor_id),
    CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- course_allowed_emails (ElementCollection)
-- -----------------------------------------------------------------------------
CREATE TABLE course_allowed_emails (
    course_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (course_id, email),
    KEY idx_cae_course (course_id),
    CONSTRAINT fk_cae_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- exam
-- -----------------------------------------------------------------------------
CREATE TABLE exam (
    exam_id BIGINT NOT NULL AUTO_INCREMENT,
    course_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NULL,
    start_date VARCHAR(255) NULL,
    start_time VARCHAR(255) NULL,
    end_date VARCHAR(255) NULL,
    end_time VARCHAR(255) NULL,
    instructions LONGTEXT NULL,
    total_marks INT NULL,
    created_at DATETIME(6) NOT NULL,
    duration INT NOT NULL,
    exam_modifier VARCHAR(255) NULL,
    isactive BIT(1) NOT NULL DEFAULT b'0',
    PRIMARY KEY (exam_id),
    KEY idx_exam_course (course_id),
    CONSTRAINT fk_exam_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- question  (FK column ex_id -> exam.exam_id ; option FK uses QId -> qid)
-- -----------------------------------------------------------------------------
CREATE TABLE question (
    que_id BIGINT NOT NULL AUTO_INCREMENT,
    question VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    marks INT NULL,
    ex_id BIGINT NULL,
    PRIMARY KEY (que_id),
    KEY idx_question_ex (ex_id),
    CONSTRAINT fk_question_exam FOREIGN KEY (ex_id) REFERENCES exam (exam_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- exam_option  (JoinColumn QId maps to qid in Hibernate MySQL8 DDL)
-- -----------------------------------------------------------------------------
CREATE TABLE exam_option (
    option_id BIGINT NOT NULL AUTO_INCREMENT,
    option_number INT NOT NULL,
    available_option VARCHAR(255) NOT NULL,
    qid BIGINT NULL,
    PRIMARY KEY (option_id),
    KEY idx_exam_option_q (qid),
    CONSTRAINT fk_exam_option_question FOREIGN KEY (qid) REFERENCES question (que_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- question_correct_options (ElementCollection<Integer>)
-- -----------------------------------------------------------------------------
CREATE TABLE question_correct_options (
    question_que_id BIGINT NOT NULL,
    correct_option_index INT NOT NULL,
    PRIMARY KEY (question_que_id, correct_option_index),
    CONSTRAINT fk_qco_question FOREIGN KEY (question_que_id) REFERENCES question (que_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- enrollments  (EnrollmentStatus: ENROLLED, PAYMENT_PENDING, CANCELLED)
-- -----------------------------------------------------------------------------
CREATE TABLE enrollments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrollment_date DATETIME(6) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ENROLLED',
    payment_transaction_id VARCHAR(255) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_enrollment (student_id, course_id),
    KEY idx_enrollments_student (student_id),
    KEY idx_enrollments_course (course_id),
    CONSTRAINT fk_enrollment_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- result
-- -----------------------------------------------------------------------------
CREATE TABLE result (
    id BIGINT NOT NULL AUTO_INCREMENT,
    answers TEXT NULL,
    attempt_date DATETIME(6) NULL,
    feedback TEXT NULL,
    passed BIT(1) NULL,
    score DOUBLE NULL,
    time_taken INT NULL,
    user_rank INT NULL,
    exam_exam_id BIGINT NULL,
    user_id BIGINT NULL,
    PRIMARY KEY (id),
    KEY idx_result_user (user_id),
    KEY idx_result_exam (exam_exam_id),
    CONSTRAINT fk_result_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_result_exam FOREIGN KEY (exam_exam_id) REFERENCES exam (exam_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Default admin user (BCrypt hash below; rotate password after first login).
-- Plaintext for reference only: Admin@123
-- =============================================================================
INSERT INTO users (username, email, password, role, email_verified)
VALUES (
    'abhijeetrane204',
    'abhijeetrane204@gmail.com',
    '$2a$10$E3guWMulvfEfZD30udQL3e51ZqRPgrp/Z9YbpbufooSRA.sHnLyha',
    'admin',
    1
);

-- =============================================================================
-- Done.
-- =============================================================================

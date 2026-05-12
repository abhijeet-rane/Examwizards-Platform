-- =============================================================================
-- Demo / recruiter seed data – Maharashtra + Computer Engineering flavour.
-- Password for every inserted user: Admin@123 (BCrypt below, same as full schema admin).
--
-- Run AFTER examwizards_full_schema_mysql8.sql (or on existing DB with tables).
-- Safe to re-run: skips users/emails that already exist; uses INSERT IGNORE where needed.
--
--   USE examwizards;
--   SOURCE examwizards_seed_demo_data.sql;
-- =============================================================================

SET NAMES utf8mb4;

-- BCrypt for plaintext Admin@123 (strength 10)
SET @pwd_admin123 := '$2a$10$E3guWMulvfEfZD30udQL3e51ZqRPgrp/Z9YbpbufooSRA.sHnLyha';

-- -----------------------------------------------------------------------------
-- Dummy users (Maharashtrian names; emails under @examwizards.demo)
-- -----------------------------------------------------------------------------
INSERT INTO users (username, email, password, role, full_name, phone_number, gender, email_verified)
SELECT 'suresh_kadam', 'suresh.kadam.instr@examwizards.demo', @pwd_admin123, 'instructor', 'Suresh Kadam', '9820456123', 'male', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'suresh.kadam.instr@examwizards.demo');

INSERT INTO users (username, email, password, role, full_name, phone_number, gender, email_verified)
SELECT 'medha_rane', 'medha.rane.instr@examwizards.demo', @pwd_admin123, 'instructor', 'Medha Rane', '9765432108', 'female', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'medha.rane.instr@examwizards.demo');

INSERT INTO users (username, email, password, role, full_name, phone_number, gender, email_verified)
SELECT 'rajesh_patil', 'rajesh.patil.student@examwizards.demo', @pwd_admin123, 'student', 'Rajesh Patil', '9890123456', 'male', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rajesh.patil.student@examwizards.demo');

INSERT INTO users (username, email, password, role, full_name, phone_number, gender, email_verified)
SELECT 'priya_sawant', 'priya.sawant.student@examwizards.demo', @pwd_admin123, 'student', 'Priya Sawant', '9123456780', 'female', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'priya.sawant.student@examwizards.demo');

INSERT INTO users (username, email, password, role, full_name, phone_number, gender, email_verified)
SELECT 'amol_bhosale', 'amol.bhosale.student@examwizards.demo', @pwd_admin123, 'student', 'Amol Bhosale', '9370654321', 'male', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'amol.bhosale.student@examwizards.demo');

INSERT INTO users (username, email, password, role, full_name, phone_number, gender, email_verified)
SELECT 'kavita_more', 'kavita.more.student@examwizards.demo', @pwd_admin123, 'student', 'Kavita More', '9881734567', 'female', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'kavita.more.student@examwizards.demo');

INSERT INTO users (username, email, password, role, full_name, phone_number, gender, email_verified)
SELECT 'nikhil_joshi', 'nikhil.joshi.student@examwizards.demo', @pwd_admin123, 'student', 'Nikhil Joshi', '9098765432', 'male', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nikhil.joshi.student@examwizards.demo');

INSERT INTO users (username, email, password, role, full_name, phone_number, gender, email_verified)
SELECT 'snehal_wagh', 'snehal.wagh.student@examwizards.demo', @pwd_admin123, 'student', 'Snehal Wagh', '9156782341', 'female', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'snehal.wagh.student@examwizards.demo');

-- -----------------------------------------------------------------------------
-- Courses (PUBLIC + FREE so landing stats look healthy)
-- -----------------------------------------------------------------------------
INSERT INTO courses (name, instructor_id, visibility, pricing, price, description)
SELECT 'Data Structures – CE Sem 3 (SPPU pattern)', u.id, 'PUBLIC', 'FREE', NULL,
       'Stack, queue, linked list, trees and graphs. Useful for Savitribai Phule Pune University computer engineering third-year pattern and campus placements in Pune–Mumbai belt.'
FROM users u
WHERE u.email = 'suresh.kadam.instr@examwizards.demo'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Data Structures – CE Sem 3 (SPPU pattern)')
LIMIT 1;

INSERT INTO courses (name, instructor_id, visibility, pricing, price, description)
SELECT 'Operating Systems – Computer Engineering', u.id, 'PUBLIC', 'FREE', NULL,
       'Processes, threads, scheduling, deadlocks, memory management. Aligned with MU and SPPU CE operating systems units.'
FROM users u
WHERE u.email = 'suresh.kadam.instr@examwizards.demo'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Operating Systems – Computer Engineering')
LIMIT 1;

INSERT INTO courses (name, instructor_id, visibility, pricing, price, description)
SELECT 'Computer Networks – CE (TCP/IP focus)', u.id, 'PUBLIC', 'FREE', NULL,
       'OSI layers, IP addressing, routing basics, HTTP and DNS. Practical flavour for engineering colleges across Maharashtra.'
FROM users u
WHERE u.email = 'medha.rane.instr@examwizards.demo'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Computer Networks – CE (TCP/IP focus)')
LIMIT 1;

INSERT INTO courses (name, instructor_id, visibility, pricing, price, description)
SELECT 'Database Management Systems – CE', u.id, 'PUBLIC', 'FREE', NULL,
       'ER model, normalization, SQL queries, transactions. Supports SPPU CE DBMS syllabus and mini-project work.'
FROM users u
WHERE u.email = 'medha.rane.instr@examwizards.demo'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Database Management Systems – CE')
LIMIT 1;

INSERT INTO courses (name, instructor_id, visibility, pricing, price, description)
SELECT 'Microprocessor 8086 – CE practicals', u.id, 'PUBLIC', 'FREE', NULL,
       '8086 architecture, addressing modes, assembly programming and interfacing concepts common in Maharashtra polytechnic and degree CE labs.'
FROM users u
WHERE u.email = 'suresh.kadam.instr@examwizards.demo'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Microprocessor 8086 – CE practicals')
LIMIT 1;

INSERT INTO courses (name, instructor_id, visibility, pricing, price, description)
SELECT 'Software Engineering – CE fundamentals', u.id, 'PUBLIC', 'FREE', NULL,
       'Requirements, design, testing, Agile basics. Helps CE students in Nagpur–Pune IT company recruitment aptitude.'
FROM users u
WHERE u.email = 'medha.rane.instr@examwizards.demo'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE name = 'Software Engineering – CE fundamentals')
LIMIT 1;

-- Optional: allow-list sample emails for private-course demos (harmless if unused)
INSERT IGNORE INTO course_allowed_emails (course_id, email)
SELECT c.id, 'rajesh.patil.student@examwizards.demo' FROM courses c WHERE c.name = 'Data Structures – CE Sem 3 (SPPU pattern)' LIMIT 1;

-- -----------------------------------------------------------------------------
-- Exams (one per course), duration minutes, total_marks match questions below
-- -----------------------------------------------------------------------------
INSERT INTO exam (course_id, title, description, start_date, start_time, end_date, end_time, instructions, total_marks, created_at, duration, exam_modifier, isactive)
SELECT c.id,
       'Mid-unit assessment – Data Structures',
       'Short MCQ check on complexity and basic structures.',
       '2026-05-15', '09:00', '2026-05-15', '11:00',
       'Choose one option per question. No negative marking.',
       3, NOW(6), 45, 'seed', 1
FROM courses c
WHERE c.name = 'Data Structures – CE Sem 3 (SPPU pattern)'
  AND NOT EXISTS (SELECT 1 FROM exam e JOIN courses co ON e.course_id = co.id WHERE co.name = 'Data Structures – CE Sem 3 (SPPU pattern)' AND e.title = 'Mid-unit assessment – Data Structures')
LIMIT 1;

INSERT INTO exam (course_id, title, description, total_marks, created_at, duration, exam_modifier, isactive)
SELECT c.id, 'OS basics – processes and scheduling', 'Revision quiz for CE internal exams.', 3, NOW(6), 40, 'seed', 1
FROM courses c
WHERE c.name = 'Operating Systems – Computer Engineering'
  AND NOT EXISTS (SELECT 1 FROM exam e JOIN courses co ON e.course_id = co.id WHERE co.name = 'Operating Systems – Computer Engineering' AND e.title = 'OS basics – processes and scheduling')
LIMIT 1;

INSERT INTO exam (course_id, title, description, total_marks, created_at, duration, exam_modifier, isactive)
SELECT c.id, 'Networks – layers and protocols', 'TCP/IP and OSI quick check.', 3, NOW(6), 40, 'seed', 1
FROM courses c
WHERE c.name = 'Computer Networks – CE (TCP/IP focus)'
  AND NOT EXISTS (SELECT 1 FROM exam e JOIN courses co ON e.course_id = co.id WHERE co.name = 'Computer Networks – CE (TCP/IP focus)' AND e.title = 'Networks – layers and protocols')
LIMIT 1;

INSERT INTO exam (course_id, title, description, total_marks, created_at, duration, exam_modifier, isactive)
SELECT c.id, 'SQL and normalization', 'DBMS essentials for CE students.', 3, NOW(6), 35, 'seed', 1
FROM courses c
WHERE c.name = 'Database Management Systems – CE'
  AND NOT EXISTS (SELECT 1 FROM exam e JOIN courses co ON e.course_id = co.id WHERE co.name = 'Database Management Systems – CE' AND e.title = 'SQL and normalization')
LIMIT 1;

INSERT INTO exam (course_id, title, description, total_marks, created_at, duration, exam_modifier, isactive)
SELECT c.id, '8086 addressing modes', 'Microprocessor objective quiz.', 3, NOW(6), 30, 'seed', 1
FROM courses c
WHERE c.name = 'Microprocessor 8086 – CE practicals'
  AND NOT EXISTS (SELECT 1 FROM exam e JOIN courses co ON e.course_id = co.id WHERE co.name = 'Microprocessor 8086 – CE practicals' AND e.title = '8086 addressing modes')
LIMIT 1;

INSERT INTO exam (course_id, title, description, total_marks, created_at, duration, exam_modifier, isactive)
SELECT c.id, 'Software Engineering terminology', 'SDLC and testing basics.', 3, NOW(6), 30, 'seed', 1
FROM courses c
WHERE c.name = 'Software Engineering – CE fundamentals'
  AND NOT EXISTS (SELECT 1 FROM exam e JOIN courses co ON e.course_id = co.id WHERE co.name = 'Software Engineering – CE fundamentals' AND e.title = 'Software Engineering terminology')
LIMIT 1;

-- -----------------------------------------------------------------------------
-- Helper: insert 3 MCQs per exam (type mcq, marks 1). correct_option_index = 0-based
-- index into options list (matches ApiExamController scoring).
-- -----------------------------------------------------------------------------
-- Exam 1 – Data Structures
SET @ex := (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Data Structures – CE Sem 3 (SPPU pattern)' AND e.title = 'Mid-unit assessment – Data Structures' LIMIT 1);

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Time complexity of binary search on sorted array is?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Time complexity of binary search%');

SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Time complexity of binary search%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'O(log n)', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'O(n)', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'O(n log n)', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'O(1)', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 0 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Which structure is best for undo in editor?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Which structure is best for undo%');

SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Which structure is best for undo%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Stack', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Queue', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Array', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Heap', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 0 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'DFS uses which auxiliary structure?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'DFS uses which auxiliary%');

SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'DFS uses which auxiliary%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Stack', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Queue', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Priority queue', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Hash table', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 0 FROM DUAL WHERE @q > 0;

-- Exam 2 – OS
SET @ex := (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Operating Systems – Computer Engineering' AND e.title = 'OS basics – processes and scheduling' LIMIT 1);

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Which state is not a standard process state?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Which state is not a standard process state%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Which state is not a standard process state%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Ready', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Running', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Compiled', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Blocked', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 2 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Round-robin scheduling is primarily meant for?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Round-robin scheduling is primarily%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Round-robin scheduling is primarily%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Real-time guarantee', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Time-sharing fairness', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Batch throughput only', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Disk scheduling', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Deadlock requires how many conditions together?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Deadlock requires how many conditions%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Deadlock requires how many conditions%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Three', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Four', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Two', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Five', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

-- Exam 3 – CN
SET @ex := (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Computer Networks – CE (TCP/IP focus)' AND e.title = 'Networks – layers and protocols' LIMIT 1);

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Which layer routes packets between networks?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Which layer routes packets between networks%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Which layer routes packets between networks%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Physical', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Network', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Transport', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Application', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'HTTP typically uses which transport protocol?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'HTTP typically uses which transport%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'HTTP typically uses which transport%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'UDP only', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'TCP', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'ICMP', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'ARP', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'DNS resolves?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question = 'DNS resolves?');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question = 'DNS resolves?' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'MAC to IP', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Hostname to IP', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Port to process', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'IP to MAC', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

-- Exam 4 – DBMS
SET @ex := (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Database Management Systems – CE' AND e.title = 'SQL and normalization' LIMIT 1);

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Which normal form removes partial dependency?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Which normal form removes partial dependency%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Which normal form removes partial dependency%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, '1NF', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, '2NF', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, '3NF', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'BCNF only', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Primary key must be?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Primary key must be%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Primary key must be%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Nullable', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Unique and non-null', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Duplicate allowed', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Only varchar', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'ACID property “I” stands for?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'ACID property%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'ACID property%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Isolation', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Indexing', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Integrity only', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Insertion', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 0 FROM DUAL WHERE @q > 0;

-- Exam 5 – Microprocessor
SET @ex := (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Microprocessor 8086 – CE practicals' AND e.title = '8086 addressing modes' LIMIT 1);

INSERT INTO question (question, type, marks, ex_id)
SELECT '8086 has how many general purpose 16-bit registers?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE '8086 has how many general purpose%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE '8086 has how many general purpose%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, '4', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, '8', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, '16', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, '32', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'MOV AX, [BX] uses which addressing?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'MOV AX, [BX] uses which addressing%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'MOV AX, [BX] uses which addressing%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Immediate', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Register indirect', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Direct', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Implicit', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT '8086 data bus width is?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE '8086 data bus width is%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE '8086 data bus width is%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, '8 bit', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, '16 bit', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, '32 bit', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, '64 bit', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

-- Exam 6 – SE
SET @ex := (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Software Engineering – CE fundamentals' AND e.title = 'Software Engineering terminology' LIMIT 1);

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Waterfall model is?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Waterfall model is%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Waterfall model is%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Iterative only', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Sequential phases', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'No documentation', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Only testing phase', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Unit testing mainly validates?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Unit testing mainly validates%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Unit testing mainly validates%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Whole system load', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Small isolated units', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'Only UI colours', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Network cables', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

INSERT INTO question (question, type, marks, ex_id)
SELECT 'Agile prefers?', 'mcq', 1, @ex FROM DUAL
WHERE @ex IS NOT NULL AND NOT EXISTS (SELECT 1 FROM question q WHERE q.ex_id = @ex AND q.question LIKE 'Agile prefers%');
SET @q := IFNULL((SELECT que_id FROM question WHERE ex_id = @ex AND question LIKE 'Agile prefers%' LIMIT 1), 0);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 1, 'Big design upfront only', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 1);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 2, 'Working software and iterations', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 2);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 3, 'No customer feedback', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 3);
INSERT INTO exam_option (option_number, available_option, qid) SELECT 4, 'Avoid testing', @q FROM DUAL WHERE @q > 0 AND NOT EXISTS (SELECT 1 FROM exam_option o WHERE o.qid = @q AND o.option_number = 4);
INSERT IGNORE INTO question_correct_options (question_que_id, correct_option_index) SELECT @q, 1 FROM DUAL WHERE @q > 0;

-- -----------------------------------------------------------------------------
-- Enrollments: seed students into several courses (skip duplicates)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO enrollments (student_id, course_id, enrollment_date, status, payment_transaction_id, created_at, updated_at)
SELECT u.id, c.id, DATE_SUB(NOW(6), INTERVAL 10 DAY), 'ENROLLED', NULL, NOW(6), NOW(6)
FROM users u
JOIN courses c ON c.name IN (
    'Data Structures – CE Sem 3 (SPPU pattern)',
    'Operating Systems – Computer Engineering',
    'Computer Networks – CE (TCP/IP focus)'
)
WHERE u.role = 'student' AND u.email LIKE '%@examwizards.demo';

INSERT IGNORE INTO enrollments (student_id, course_id, enrollment_date, status, payment_transaction_id, created_at, updated_at)
SELECT u.id, c.id, DATE_SUB(NOW(6), INTERVAL 7 DAY), 'ENROLLED', NULL, NOW(6), NOW(6)
FROM users u
JOIN courses c ON c.name IN (
    'Database Management Systems – CE',
    'Microprocessor 8086 – CE practicals'
)
WHERE u.role = 'student' AND u.email LIKE '%@examwizards.demo';

INSERT IGNORE INTO enrollments (student_id, course_id, enrollment_date, status, payment_transaction_id, created_at, updated_at)
SELECT u.id, c.id, DATE_SUB(NOW(6), INTERVAL 4 DAY), 'ENROLLED', NULL, NOW(6), NOW(6)
FROM users u
JOIN courses c ON c.name = 'Software Engineering – CE fundamentals'
WHERE u.role = 'student' AND u.email IN (
    'rajesh.patil.student@examwizards.demo',
    'priya.sawant.student@examwizards.demo',
    'amol.bhosale.student@examwizards.demo'
);

-- -----------------------------------------------------------------------------
-- Results (attempts) — boosts “exam attempts” style metrics
-- -----------------------------------------------------------------------------
INSERT INTO result (answers, attempt_date, feedback, passed, score, time_taken, user_rank, exam_exam_id, user_id)
SELECT '{"dummy":"seed"}', DATE_SUB(NOW(6), INTERVAL 3 DAY), 'Nice attempt for demo.', 1, 2.5, 1200, 1,
       (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Data Structures – CE Sem 3 (SPPU pattern)' LIMIT 1),
       u.id
FROM users u WHERE u.email = 'rajesh.patil.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM result r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'rajesh.patil.student@examwizards.demo' AND r.exam_exam_id = (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Data Structures – CE Sem 3 (SPPU pattern)' LIMIT 1));

INSERT INTO result (answers, attempt_date, feedback, passed, score, time_taken, user_rank, exam_exam_id, user_id)
SELECT '{"dummy":"seed"}', DATE_SUB(NOW(6), INTERVAL 2 DAY), NULL, 1, 3.0, 900, 1,
       (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Operating Systems – Computer Engineering' LIMIT 1),
       u.id
FROM users u WHERE u.email = 'priya.sawant.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM result r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'priya.sawant.student@examwizards.demo' AND r.exam_exam_id = (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Operating Systems – Computer Engineering' LIMIT 1));

INSERT INTO result (answers, attempt_date, passed, score, time_taken, exam_exam_id, user_id)
SELECT '{"dummy":"seed"}', DATE_SUB(NOW(6), INTERVAL 1 DAY), 0, 1.0, 1500,
       (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Computer Networks – CE (TCP/IP focus)' LIMIT 1),
       u.id
FROM users u WHERE u.email = 'amol.bhosale.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM result r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'amol.bhosale.student@examwizards.demo' AND r.exam_exam_id = (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Computer Networks – CE (TCP/IP focus)' LIMIT 1));

INSERT INTO result (answers, attempt_date, passed, score, time_taken, exam_exam_id, user_id)
SELECT '{"dummy":"seed"}', NOW(6), 1, 2.0, 1100,
       (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Database Management Systems – CE' LIMIT 1),
       u.id
FROM users u WHERE u.email = 'kavita.more.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM result r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'kavita.more.student@examwizards.demo' AND r.exam_exam_id = (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Database Management Systems – CE' LIMIT 1));

INSERT INTO result (answers, attempt_date, passed, score, time_taken, exam_exam_id, user_id)
SELECT '{"dummy":"seed"}', DATE_SUB(NOW(6), INTERVAL 5 DAY), 1, 3.0, 800,
       (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Microprocessor 8086 – CE practicals' LIMIT 1),
       u.id
FROM users u WHERE u.email = 'nikhil.joshi.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM result r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'nikhil.joshi.student@examwizards.demo' AND r.exam_exam_id = (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Microprocessor 8086 – CE practicals' LIMIT 1));

INSERT INTO result (answers, attempt_date, passed, score, time_taken, exam_exam_id, user_id)
SELECT '{"dummy":"seed"}', DATE_SUB(NOW(6), INTERVAL 6 DAY), 1, 2.5, 950,
       (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Software Engineering – CE fundamentals' LIMIT 1),
       u.id
FROM users u WHERE u.email = 'snehal.wagh.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM result r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'snehal.wagh.student@examwizards.demo' AND r.exam_exam_id = (SELECT e.exam_id FROM exam e JOIN courses c ON e.course_id = c.id WHERE c.name = 'Software Engineering – CE fundamentals' LIMIT 1));

-- -----------------------------------------------------------------------------
-- Reviews (public credibility)
-- -----------------------------------------------------------------------------
INSERT INTO reviews (user_id, content, rating, created_at, updated_at, is_approved, is_active)
SELECT u.id,
       'Course aligned well with our SPPU data structures internal exam. Examples were clear for Pune engineering college pattern.',
       5, DATE_SUB(NOW(6), INTERVAL 12 DAY), DATE_SUB(NOW(6), INTERVAL 12 DAY), 1, 1
FROM users u WHERE u.email = 'rajesh.patil.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM reviews r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'rajesh.patil.student@examwizards.demo' AND r.content LIKE 'Course aligned well with our SPPU%');

INSERT INTO reviews (user_id, content, rating, created_at, updated_at, is_approved, is_active)
SELECT u.id,
       'Operating systems quiz helped before Mumbai university CE semester exam.',
       4, DATE_SUB(NOW(6), INTERVAL 9 DAY), DATE_SUB(NOW(6), INTERVAL 9 DAY), 1, 1
FROM users u WHERE u.email = 'priya.sawant.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM reviews r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'priya.sawant.student@examwizards.demo' AND r.content LIKE 'Operating systems quiz helped%');

INSERT INTO reviews (user_id, content, rating, created_at, updated_at, is_approved, is_active)
SELECT u.id,
       'Networks MCQs match what we study in CE coursework in Nashik colleges.',
       5, DATE_SUB(NOW(6), INTERVAL 6 DAY), DATE_SUB(NOW(6), INTERVAL 6 DAY), 1, 1
FROM users u WHERE u.email = 'amol.bhosale.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM reviews r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'amol.bhosale.student@examwizards.demo' AND r.content LIKE 'Networks MCQs match%');

INSERT INTO reviews (user_id, content, rating, created_at, updated_at, is_approved, is_active)
SELECT u.id,
       'DBMS quiz useful for practical oral and written CE exams.',
       4, DATE_SUB(NOW(6), INTERVAL 4 DAY), DATE_SUB(NOW(6), INTERVAL 4 DAY), 1, 1
FROM users u WHERE u.email = 'kavita.more.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM reviews r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'kavita.more.student@examwizards.demo' AND r.content LIKE 'DBMS quiz useful%');

INSERT INTO reviews (user_id, content, rating, created_at, updated_at, is_approved, is_active)
SELECT u.id,
       '8086 sheet revision matched our polytechnic style lab viva questions.',
       5, DATE_SUB(NOW(6), INTERVAL 2 DAY), DATE_SUB(NOW(6), INTERVAL 2 DAY), 1, 1
FROM users u WHERE u.email = 'nikhil.joshi.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM reviews r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'nikhil.joshi.student@examwizards.demo' AND r.content LIKE '8086 sheet revision%');

INSERT INTO reviews (user_id, content, rating, created_at, updated_at, is_approved, is_active)
SELECT u.id,
       'Software engineering basics explained simply for placement aptitude near Pune IT park.',
       5, DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_SUB(NOW(6), INTERVAL 1 DAY), 1, 1
FROM users u WHERE u.email = 'snehal.wagh.student@examwizards.demo'
AND NOT EXISTS (SELECT 1 FROM reviews r JOIN users u2 ON r.user_id = u2.id WHERE u2.email = 'snehal.wagh.student@examwizards.demo' AND r.content LIKE 'Software engineering basics explained%');

-- -----------------------------------------------------------------------------
-- Contact messages (looks alive)
-- -----------------------------------------------------------------------------
INSERT INTO contact_message (name, email, subject, message, status, submitted_at, updated_at, reference_number)
SELECT 'Vijay Shinde', 'vijay.shinde.contact@gmail.com', 'Batch enquiry Nagpur CE',
       'We are third year computer engineering batch from Nagpur; want to know if bulk enrolment for OS course is possible.', 'REPLIED',
       DATE_SUB(NOW(6), INTERVAL 8 DAY), DATE_SUB(NOW(6), INTERVAL 7 DAY), 'REF-MH-20260501-001'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM contact_message WHERE reference_number = 'REF-MH-20260501-001');

INSERT INTO contact_message (name, email, subject, message, status, submitted_at, reference_number)
SELECT 'Anita Raut', 'anita.raut.contact@gmail.com', 'Course suggestion Kolhapur',
       'Please add more questions on linked list as per CE syllabus we follow locally.', 'IN_PROGRESS',
       DATE_SUB(NOW(6), INTERVAL 3 DAY), 'REF-MH-20260508-002'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM contact_message WHERE reference_number = 'REF-MH-20260508-002');

INSERT INTO contact_message (name, email, subject, message, status, submitted_at, reference_number)
SELECT 'Rahul Chavan', 'rahul.chavan.contact@gmail.com', 'Login help',
       'Student from Aurangabad CE branch facing OTP delay.', 'PENDING',
       DATE_SUB(NOW(6), INTERVAL 1 DAY), 'REF-MH-20260510-003'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM contact_message WHERE reference_number = 'REF-MH-20260510-003');

-- =============================================================================
-- Done. Login any seeded user with password Admin@123
-- =============================================================================

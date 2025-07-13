-- EduTrack Database Schema
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS edutrack;
USE edutrack;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    class VARCHAR(20) NOT NULL,
    section VARCHAR(10),
    parent_name VARCHAR(100),
    parent_email VARCHAR(100),
    parent_phone VARCHAR(20),
    address TEXT,
    admission_date DATE,
    status ENUM('Active', 'Inactive', 'Graduated') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT,
    credits INT DEFAULT 1,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_name VARCHAR(100) NOT NULL,
    subject_id INT NOT NULL,
    exam_type ENUM('Midterm', 'Final', 'Quiz', 'Assignment') NOT NULL,
    exam_date DATE NOT NULL,
    total_marks INT NOT NULL DEFAULT 100,
    passing_marks INT NOT NULL DEFAULT 40,
    description TEXT,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Marks table
CREATE TABLE IF NOT EXISTS marks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    grade VARCHAR(2),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_exam (student_id, exam_id)
);

-- Notifications table (for email/SMS logs)
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    type ENUM('Email', 'SMS') NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    recipient VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Sent', 'Failed') DEFAULT 'Pending',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO admins (username, password, email, full_name) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@edutrack.com', 'System Administrator');

-- Insert sample subjects
INSERT INTO subjects (subject_code, subject_name, description, credits) VALUES 
('MATH101', 'Mathematics', 'Basic mathematics including algebra and geometry', 4),
('ENG101', 'English', 'English language and literature', 3),
('SCI101', 'Science', 'General science including physics, chemistry, and biology', 4),
('HIST101', 'History', 'World history and social studies', 3),
('COMP101', 'Computer Science', 'Introduction to programming and computer fundamentals', 4);

-- Insert sample students
INSERT INTO students (student_id, first_name, last_name, email, phone, date_of_birth, gender, class, section, parent_name, parent_email, parent_phone) VALUES 
('STU001', 'John', 'Doe', 'john.doe@student.com', '1234567890', '2005-03-15', 'Male', '10th', 'A', 'Robert Doe', 'robert.doe@email.com', '1234567891'),
('STU002', 'Jane', 'Smith', 'jane.smith@student.com', '1234567892', '2005-07-22', 'Female', '10th', 'A', 'Michael Smith', 'michael.smith@email.com', '1234567893'),
('STU003', 'Mike', 'Johnson', 'mike.johnson@student.com', '1234567894', '2005-01-10', 'Male', '10th', 'B', 'David Johnson', 'david.johnson@email.com', '1234567895');

-- Insert sample exams
INSERT INTO exams (exam_name, subject_id, exam_type, exam_date, total_marks, passing_marks) VALUES 
('Midterm Mathematics', 1, 'Midterm', '2024-03-15', 100, 40),
('Final English', 2, 'Final', '2024-06-20', 100, 40),
('Science Quiz', 3, 'Quiz', '2024-04-10', 50, 20);

-- Insert sample marks
INSERT INTO marks (student_id, exam_id, marks_obtained, grade, remarks) VALUES 
(1, 1, 85.5, 'A', 'Excellent performance'),
(1, 2, 78.0, 'B+', 'Good work'),
(2, 1, 92.0, 'A+', 'Outstanding'),
(2, 2, 88.5, 'A', 'Very good'),
(3, 1, 75.0, 'B', 'Satisfactory'),
(3, 3, 42.0, 'C', 'Needs improvement'); 
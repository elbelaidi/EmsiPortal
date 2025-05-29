-- Create database if it doesn't exist
CREATE DATABASE emsiportal;

-- Connect to the database
\c emsiportal;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(user_id),
    department VARCHAR(100),
    year VARCHAR(20),
    class VARCHAR(50),
    phone_number VARCHAR(20),
    address TEXT,
    image_recog VARCHAR(255),
    profile_image VARCHAR(255),
    absences INTEGER DEFAULT 0,
    justified_absences INTEGER DEFAULT 0,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create absences table
CREATE TABLE IF NOT EXISTS absences (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(student_id),
    subject VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reason TEXT,
    description TEXT,
    document_url VARCHAR(255),
    submitted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    students TEXT[] -- Array of student IDs
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    room VARCHAR(50) NOT NULL,
    day VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    professor VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL
);

-- Insert some test data
INSERT INTO users (username, email, password_hash, role, first_name, last_name)
VALUES 
    ('admin', 'admin@emsi.ma', '1234', 'supervisor', 'Admin', 'User'),
    ('student1', 'student1@emsi.ma', '1234', 'student', 'John', 'Doe');

INSERT INTO students (first_name, last_name, email, student_id, department, year, class, phone_number, address, user_id)
VALUES 
    ('John', 'Doe', 'student1@emsi.ma', 'STU001', 'Informatique', '3ème année', 'GI3', '+212 6XX-XXXXXX', 'Casablanca, Morocco', 
    (SELECT user_id FROM users WHERE email = 'student1@emsi.ma'));

INSERT INTO classes (name, department, year, students)
VALUES 
    ('GI3', 'Informatique', '3ème année', ARRAY['STU001']);

INSERT INTO courses (name, room, day, start_time, end_time, professor, department, year)
VALUES 
    ('Base de données', 'Salle 1', 'Lundi', '08:00', '10:00', 'Prof. Smith', 'Informatique', '3ème année'),
    ('Programmation Web', 'Salle 2', 'Mardi', '10:00', '12:00', 'Prof. Johnson', 'Informatique', '3ème année');

INSERT INTO absences (student_id, subject, date, time, status, reason)
VALUES 
    ('STU001', 'Base de données', CURRENT_DATE, '08:00', 'pending', 'Medical appointment'),
    ('STU001', 'Programmation Web', CURRENT_DATE, '10:00', 'justified', 'Family emergency'); 
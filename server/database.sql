-- AWS Cloud Club PUP San Juan Database Schema

-- Create database (run this separately if needed)
-- CREATE DATABASE aws_cloud_club;

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url VARCHAR(500),
    github_link VARCHAR(500),
    linkedin_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO members (name, role, bio, image_url, github_link, linkedin_link) VALUES
('John Doe', 'President', 'Computer Science major passionate about cloud computing and AWS services. Leading the club to help students learn cloud technologies.', 'https://via.placeholder.com/150', 'https://github.com/johndoe', 'https://linkedin.com/in/johndoe'),
('Jane Smith', 'Vice President', 'Information Technology student with expertise in DevOps and containerization. Helping organize workshops and events.', 'https://via.placeholder.com/150', 'https://github.com/janesmith', 'https://linkedin.com/in/janesmith'),
('Mike Johnson', 'Technical Lead', 'Software Engineering student focused on serverless architecture and microservices. Manages technical workshops.', 'https://via.placeholder.com/150', 'https://github.com/mikejohnson', 'https://linkedin.com/in/mikejohnson'),
('Sarah Williams', 'Secretary', 'Computer Science student with strong organizational skills. Handles club documentation and communications.', 'https://via.placeholder.com/150', 'https://github.com/sarahwilliams', 'https://linkedin.com/in/sarahwilliams');

INSERT INTO events (title, description, event_date, event_time, location, image_url) VALUES
('AWS Cloud Essentials Workshop', 'Learn the fundamentals of AWS cloud services including EC2, S3, and Lambda. Perfect for beginners!', '2024-02-15', '14:00:00', 'PUP San Juan IT Building Room 301', 'https://via.placeholder.com/400x200'),
('Serverless Architecture Deep Dive', 'Explore advanced serverless patterns using AWS Lambda, API Gateway, and DynamoDB.', '2024-02-22', '15:00:00', 'PUP San Juan IT Building Room 302', 'https://via.placeholder.com/400x200'),
('AWS Certification Study Group', 'Join our weekly study group to prepare for AWS Cloud Practitioner and Solutions Architect certifications.', '2024-02-29', '16:00:00', 'PUP San Juan Library Conference Room', 'https://via.placeholder.com/400x200');

INSERT INTO announcements (title, content, author, image_url) VALUES
('Welcome to AWS Cloud Club PUP San Juan!', 'We are excited to launch our official AWS Student Cloud Club! Join us to learn about cloud computing, get AWS certifications, and connect with industry professionals.', 'John Doe', 'https://via.placeholder.com/600x300'),
('New Workshop Schedule Released', 'Check out our upcoming workshops for this semester. We have sessions covering everything from basic cloud concepts to advanced serverless architectures.', 'Jane Smith', 'https://via.placeholder.com/600x300'),
('AWS Educate Credits Available', 'Members can now access free AWS credits through the AWS Educate program. Contact us for more information on how to apply.', 'Mike Johnson', 'https://via.placeholder.com/600x300');

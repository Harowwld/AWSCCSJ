const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Mock data fallback (used when DB creds are missing/disabled)
const mockMembers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'President',
    bio: 'Computer Science major passionate about cloud computing and AWS services. Leading the club to help students learn cloud technologies.',
    image_url: 'https://via.placeholder.com/150',
    github_link: 'https://github.com/johndoe',
    linkedin_link: 'https://linkedin.com/in/johndoe',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Vice President',
    bio: 'Information Technology student with expertise in DevOps and containerization. Helping organize workshops and events.',
    image_url: 'https://via.placeholder.com/150',
    github_link: 'https://github.com/janesmith',
    linkedin_link: 'https://linkedin.com/in/janesmith',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'Technical Lead',
    bio: 'Software Engineering student focused on serverless architecture and microservices. Manages technical workshops.',
    image_url: 'https://via.placeholder.com/150',
    github_link: 'https://github.com/mikejohnson',
    linkedin_link: 'https://linkedin.com/in/mikejohnson',
  },
  {
    id: 4,
    name: 'Sarah Williams',
    role: 'Secretary',
    bio: 'Computer Science student with strong organizational skills. Handles club documentation and communications.',
    image_url: 'https://via.placeholder.com/150',
    github_link: 'https://github.com/sarahwilliams',
    linkedin_link: 'https://linkedin.com/in/sarahwilliams',
  },
];

const mockEvents = [
  {
    id: 1,
    title: 'AWS Cloud Essentials Workshop',
    description: 'Learn the fundamentals of AWS cloud services including EC2, S3, and Lambda. Perfect for beginners!',
    event_date: '2024-02-15',
    event_time: '14:00:00',
    location: 'PUP San Juan IT Building Room 301',
    image_url: 'https://via.placeholder.com/400x200',
  },
  {
    id: 2,
    title: 'Serverless Architecture Deep Dive',
    description: 'Explore advanced serverless patterns using AWS Lambda, API Gateway, and DynamoDB.',
    event_date: '2024-02-22',
    event_time: '15:00:00',
    location: 'PUP San Juan IT Building Room 302',
    image_url: 'https://via.placeholder.com/400x200',
  },
  {
    id: 3,
    title: 'AWS Certification Study Group',
    description: 'Join our weekly study group to prepare for AWS Cloud Practitioner and Solutions Architect certifications.',
    event_date: '2024-02-29',
    event_time: '16:00:00',
    location: 'PUP San Juan Library Conference Room',
    image_url: 'https://via.placeholder.com/400x200',
  },
];

const mockAnnouncements = [
  {
    id: 1,
    title: 'Welcome to AWS Cloud Club PUP San Juan!',
    content: 'We are excited to launch our official AWS Student Cloud Club! Join us to learn about cloud computing, get AWS certifications, and connect with industry professionals.',
    author: 'John Doe',
    image_url: 'https://via.placeholder.com/600x300',
    created_at: '2024-01-20',
  },
  {
    id: 2,
    title: 'New Workshop Schedule Released',
    content: 'Check out our upcoming workshops for this semester. We have sessions covering everything from basic cloud concepts to advanced serverless architectures.',
    author: 'Jane Smith',
    image_url: 'https://via.placeholder.com/600x300',
    created_at: '2024-01-25',
  },
  {
    id: 3,
    title: 'AWS Educate Credits Available',
    content: 'Members can now access free AWS credits through the AWS Educate program. Contact us for more information on how to apply.',
    author: 'Mike Johnson',
    image_url: 'https://via.placeholder.com/600x300',
    created_at: '2024-02-01',
  },
];

const dbEnabled = Boolean(
  process.env.DB_HOST &&
  process.env.DB_PORT &&
  process.env.DB_NAME &&
  process.env.DB_USER &&
  typeof process.env.DB_PASSWORD === 'string' &&
  process.env.DB_PASSWORD.trim() !== '' &&
  process.env.USE_MOCK_DATA !== 'true'
);

let pool = null;

if (dbEnabled) {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Database connected successfully at:', res.rows[0].now);
    }
  });
} else {
  console.warn('DB connection disabled or missing credentials. Serving mock data. Set USE_MOCK_DATA=false and DB_* vars to enable DB.');
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'AWS Cloud Club PUP San Juan API is running!',
    dbEnabled,
    mode: dbEnabled ? 'database' : 'mock',
  });
});

// Members routes
app.get('/api/members', async (req, res) => {
  try {
    if (!pool) return res.json(mockMembers);
    const result = await pool.query('SELECT * FROM members ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database disabled. Enable DB_* env vars.' });
    const { name, role, bio, image_url, github_link, linkedin_link } = req.body;
    const result = await pool.query(
      'INSERT INTO members (name, role, bio, image_url, github_link, linkedin_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, role, bio, image_url, github_link, linkedin_link]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Events routes
app.get('/api/events', async (req, res) => {
  try {
    if (!pool) return res.json(mockEvents);
    const result = await pool.query('SELECT * FROM events ORDER BY event_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database disabled. Enable DB_* env vars.' });
    const { title, description, event_date, location, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO events (title, description, event_date, location, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, event_date, location, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Announcements routes
app.get('/api/announcements', async (req, res) => {
  try {
    if (!pool) return res.json(mockAnnouncements);
    const result = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    if (!pool) return res.status(503).json({ error: 'Database disabled. Enable DB_* env vars.' });
    const { title, content, author, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO announcements (title, content, author, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, author, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Contact form route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Here you would typically send an email using nodemailer
    // For now, we'll just log it and return success
    console.log('Contact form submission:', { name, email, message });
    
    res.status(200).json({ message: 'Contact form submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

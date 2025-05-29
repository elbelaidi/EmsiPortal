import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
const port = 3002; // Different port from main server

// Enable CORS
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'emsiportal',
  password: '1234',
  port: 5432,
});

// Test database connection
app.get('/api/test/connection', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'success', 
      message: 'Database connection successful',
      timestamp: result.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: err.message 
    });
  }
});

// Test user creation
app.post('/api/test/users', async (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, username, email, first_name, last_name, role`,
      [username, email, hashedPassword, firstName, lastName, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create user',
      error: err.message 
    });
  }
});

// Test student creation
app.post('/api/test/students', async (req, res) => {
  const { userId, department, year, class: studentClass } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO students (user_id, department, year, class, enrollment_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       RETURNING *`,
      [userId, department, year, studentClass]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create student',
      error: err.message 
    });
  }
});

// Test absence creation
app.post('/api/test/absences', async (req, res) => {
  const { studentId, date, isJustified, justificationDocumentUrl } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO absences (student_id, date, is_justified, justification_document_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [studentId, date, isJustified, justificationDocumentUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create absence record',
      error: err.message 
    });
  }
});

// Test complex query - Get student with absences
app.get('/api/test/students/:studentId/absences', async (req, res) => {
  const { studentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        s.student_id,
        u.first_name,
        u.last_name,
        s.department,
        s.year,
        s.class,
        COUNT(a.absence_id) as total_absences,
        COUNT(CASE WHEN a.is_justified THEN 1 END) as justified_absences
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN absences a ON s.student_id = a.student_id
       WHERE s.student_id = $1
       GROUP BY s.student_id, u.first_name, u.last_name, s.department, s.year, s.class`,
      [studentId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch student absences',
      error: err.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Test API server running on port ${port}`);
}); 
import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const app = express();


// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

const port = 3001;

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'emsiportal',
  password: '1234',
  port: 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database');
  
  // Alter profile_image column type
  client.query(`
    ALTER TABLE users 
    ALTER COLUMN profile_image TYPE TEXT;
  `, (err) => {
    if (err) {
      console.error('Error altering profile_image column:', err);
    } else {
      console.log('Successfully altered profile_image column to TEXT type');
    }
    release();
  });
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add raw body parser for large payloads
app.use((req, res, next) => {
  if (req.originalUrl === '/api/users/:id/profile-picture') {
    express.raw({ type: 'application/json', limit: '50mb' })(req, res, next);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming ${req.method} request to ${req.originalUrl}`);
  console.log('Request headers:', req.headers);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/absence_documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only PDF, JPG, JPEG, and PNG files
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// API Endpoints
app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
      console.log(`Login attempt - Email: ${email}, Role: ${role}`);
      console.log(`Checking for user with email: ${email} and role: ${role}`);
      
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND role = $2', 
        [email, role]
      );
      
      if (rows.length === 0) {
        console.log('No user found with these credentials');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const user = rows[0];
      console.log(`Found user: ${JSON.stringify(user)}`);
      console.log(`Comparing passwords - Input: ${password}, DB: ${user.password_hash}`);
      
      // Temporary transition: Check if password is plaintext (length < 60)
      let isPasswordValid;
      if (user.password_hash.length < 60) {
        isPasswordValid = (password === user.password_hash);
        if (isPasswordValid) {
          // Hash the plaintext password for future logins
          const hashedPassword = await bcrypt.hash(password, 10);
          await pool.query(
            'UPDATE users SET password_hash = $1 WHERE user_id = $2',
            [hashedPassword, user.user_id]
          );
        }
      } else {
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
      }
      
      if (!isPasswordValid) {
        console.log('Password does not match');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('Login successful');
      res.json({ 
        user_id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phoneNumber: user.phone_number,
        address: user.address,
        profileImage: user.profile_image
      });
      
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).send('Server Error');
    }
});

app.post('/api/students', async (req, res) => {
    const { firstName, lastName, email, studentId, department, year, class: studentClass } = req.body;
    try {
        const newStudent = await pool.query(
            'INSERT INTO students (first_name, last_name, email, student_id, department, year, class) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [firstName, lastName, email, studentId, department, year, studentClass]
        );
        res.status(201).json(newStudent.rows[0]);
    } catch (err) {
        console.error('Error creating student:', err);
        res.status(500).send('Server Error');
    }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      department,
      year,
      class: className,
      phone_number,
      address,
      user_id
    } = req.body;

    const result = await pool.query(
      `UPDATE students 
       SET first_name = $1, last_name = $2, email = $3, department = $4, 
           year = $5, class = $6, phone_number = $7, address = $8, user_id = $9
       WHERE student_id = $10
       RETURNING *`,
      [first_name, last_name, email, department, year, className, phone_number, address, user_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedStudent = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        if (deletedStudent.rowCount === 0) {
            return res.status(404).send('Student not found');
        }
        res.json(deletedStudent.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY last_name, first_name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
    const { username, email, password_hash, role } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, password_hash, role]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Server Error');
    }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phoneNumber, address } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users 
       SET first_name = $1, 
           last_name = $2, 
           email = $3, 
           phone_number = $4,
           address = $5 
       WHERE user_id = $6 
       RETURNING *`,
      [firstName, lastName, email, phoneNumber, address, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Debug endpoint
app.get('/api/debug/users', async (req, res) => {
  try {
    // Get table structure
    const structure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    // Get sample data
    const sample = await pool.query('SELECT * FROM users LIMIT 1');
    
    res.json({
      structure: structure.rows,
      sample: sample.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/api/absences', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM absences');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching absences:', err);
    res.status(500).json({ error: 'Failed to fetch absences' });
  }
});

app.get('/api/classes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM classes');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM courses');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM students WHERE student_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/students/:id/absences', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM absences WHERE student_id = $1 ORDER BY date DESC, time DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching student absences:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/students/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const studentResult = await pool.query('SELECT department, year FROM students WHERE student_id = $1', [id]);
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const { department, year } = studentResult.rows[0];
    const coursesResult = await pool.query(
      'SELECT * FROM courses WHERE department = $1 AND year = $2 ORDER BY day, start_time',
      [department, year]
    );
    
    res.json(coursesResult.rows);
  } catch (err) {
    console.error('Error fetching student courses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new student
app.post('/api/students', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      student_id,
      department,
      year,
      class: className,
      phone_number,
      address,
      user_id
    } = req.body;

    const result = await pool.query(
      `INSERT INTO students 
       (first_name, last_name, email, student_id, department, year, class, phone_number, address, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [first_name, last_name, email, student_id, department, year, className, phone_number, address, user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM students WHERE student_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile picture
app.put('/api/users/:id/profile-picture', async (req, res) => {
  const { id } = req.params;
  const { profile_image } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users 
       SET profile_image = $1 
       WHERE user_id = $2 
       RETURNING *`,
      [profile_image, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating profile picture:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new endpoint to fetch user details
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = rows[0];
    res.json({
      user_id: user.user_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      phoneNumber: user.phone_number,
      address: user.address,
      profileImage: user.profile_image
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update password
app.put('/api/users/:id/password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  try {
    // First verify the current password
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [hashedPassword, id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Courses endpoints
app.post('/api/courses', async (req, res) => {
  const { name, room, day, startTime, endTime, professor, department, year } = req.body;
  try {
    const newCourse = await pool.query(
      'INSERT INTO courses (name, room, day, start_time, end_time, professor, department, year) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, room, day, startTime, endTime, professor, department, year]
    );
    res.status(201).json(newCourse.rows[0]);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { name, room, day, startTime, endTime, professor, department, year } = req.body;
  try {
    const updatedCourse = await pool.query(
      'UPDATE courses SET name = $1, room = $2, day = $3, start_time = $4, end_time = $5, professor = $6, department = $7, year = $8 WHERE id = $9 RETURNING *',
      [name, room, day, startTime, endTime, professor, department, year, id]
    );
    if (updatedCourse.rowCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(updatedCourse.rows[0]);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCourse = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    if (deletedCourse.rowCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(deletedCourse.rows[0]);
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

app.get('/api/courses/:department/:year', async (req, res) => {
  const { department, year } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM courses WHERE department = $1 AND year = $2 ORDER BY day, start_time',
      [department, year]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create new absence claim with file upload
app.post('/api/absences', upload.single('document'), async (req, res) => {
  const { student_id, subject, date, time, reason, description } = req.body;
  const document_url = req.file ? `/uploads/absence_documents/${req.file.filename}` : null;
  
  try {
    // First verify that the student exists
    const studentResult = await pool.query(
      'SELECT * FROM students WHERE student_id = $1',
      [student_id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const result = await pool.query(
      `INSERT INTO absences 
       (student_id, subject, date, time, status, reason, description, document_url, submitted_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING *`,
      [student_id, subject, date, time, 'pending', reason, description, document_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating absence claim:', err);
    res.status(500).json({ error: 'Failed to create absence claim' });
  }
});

// Update absence status
app.patch('/api/absences/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE absences SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Absence not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating absence status:', err);
    res.status(500).json({ error: 'Failed to update absence status' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (err) => {
  console.error('Error starting server:', err);
});

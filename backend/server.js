const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Updated to use mysql2 for promises
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const app = express();


const saltRounds = 10;

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',       
  password: '',   
  database: 'proftal',          
});

app.use(cors());
app.use(bodyParser.json());
app.use(helmet()); // Add helmet middleware
app.use(express.json());

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use the original filename or generate a unique name
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// File upload endpoint
app.post('/uploadfile', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // File upload successful
  res.json({
    message: 'File uploaded successfully!',
    file: req.file,
  });
});

/* Start the server
app.listen(port, () => {
  console.log(`Server running on http://192.168.0.69:${port}`);
});*/



// Error handling middleware for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

/*--------------------------Grades----------------*/

// Endpoint to fetch grades and sections by department ID
app.get('/grades/:dept_ID', (req, res) => {
  const dept_ID = req.params.dept_ID;

  const sqlFetchGrades = `
    SELECT g.grade, g.section
    FROM grades g
    WHERE g.dept_ID = ?`;

  db.query(sqlFetchGrades, [dept_ID], (err, results) => {
    if (err) {
      console.error('Error fetching grades:', err);
      return res.status(500).json({ error: 'Error fetching grades' });
    }

    res.json(results);
  });
});



// Endpoint to fetch grades by department ID
app.get('/grades/:dept_ID', (req, res) => {
  const dept_ID = req.params.dept_ID;

  const sqlFetchGrades = 'SELECT * FROM grades WHERE dept_ID = ?';
  db.query(sqlFetchGrades, [dept_ID], (err, results) => {
    if (err) {
      console.error('Error fetching grades:', err);
      return res.status(500).json({ error: 'Error fetching grades' });
    }

    res.json(results);
  });
});


/* Insert a new grade
app.post('/addGrade', (req, res) => {
  const { grade, section, dept_ID } = req.body;
  const sql = 'INSERT INTO grades (grade, section, dept_ID) VALUES (?, ?, ?)';
  db.query(sql, [grade, section, dept_ID], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Grade added successfully', grades_ID: results.insertId });
  });
});*/


// Endpoint to add a new grade and corresponding content
app.post('/addGrade', (req, res) => {
  const { grade, section, dept_ID } = req.body;

  // Begin transaction
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).json({ error: 'Error getting database connection' });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        connection.release();
        return res.status(500).json({ error: 'Error starting transaction' });
      }

      // Insert grade into grades table
      const sqlInsertGrade = 'INSERT INTO grades (grade, section, dept_ID) VALUES (?, ?, ?)';
      connection.query(sqlInsertGrade, [grade, section, dept_ID], (err, results) => {
        if (err) {
          console.error('Error inserting grade:', err);
          return connection.rollback(() => {
            connection.release();
            return res.status(500).json({ error: 'Error inserting grade' });
          });
        }

        const grades_ID = results.insertId;
        console.log(`Grade inserted with ID: ${grades_ID}`);

        // Insert into contents table
        const sqlInsertContent = 'INSERT INTO contents (grades_ID) VALUES (?)';
        connection.query(sqlInsertContent, [grades_ID], (err, results) => {
          if (err) {
            console.error('Error inserting content:', err);
            return connection.rollback(() => {
              connection.release();
              return res.status(500).json({ error: 'Error inserting content' });
            });
          }

          console.log(`Content inserted with grade ID: ${grades_ID}`);

          // Commit transaction
          connection.commit((err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              return connection.rollback(() => {
                connection.release();
                return res.status(500).json({ error: 'Error committing transaction' });
              });
            }

            connection.release();
            res.json({ message: 'Grade and content added successfully', grades_ID });
          });
        });
      });
    });
  });
});


// Update an existing grade
app.put('/updateGrade/:grades_ID', (req, res) => {
  const grades_ID = req.params.grades_ID;
  const { grade, section } = req.body;
  const sql = 'UPDATE grades SET grade = ?, section = ? WHERE grades_ID = ?';
  db.query(sql, [grade, section, grades_ID], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Grade updated successfully' });
  });
});


/*-----------------------------------Content---------------------------*/

// Endpoint to fetch content by grades ID
app.get('/content/:grades_ID', (req, res) => {
  const grades_ID = req.params.grades_ID;

  const sqlFetchContent = `
    SELECT c.*, g.grade, g.section 
    FROM contents c 
    JOIN grades g ON c.grades_ID = g.grades_id 
    WHERE c.grades_ID = ?`;

  db.query(sqlFetchContent, [grades_ID], (err, results) => {
    if (err) {
      console.error('Error fetching content:', err);
      return res.status(500).json({ error: 'Error fetching content' });
    }

    res.json(results);
  });
});


// Endpoint to add a department and update contents table
app.post('/addDepartment', (req, res) => {
  const { dept_name, dept_info } = req.body;
  
  if (!dept_name) {
    return res.status(400).json({ error: 'Department name is required' });
  }
  
  // Insert new department
  const insertDeptQuery = 'INSERT INTO department (dept_name, dept_info) VALUES (?, ?)';
  
  db.query(insertDeptQuery, [dept_name, dept_info], (err, result) => {
    if (err) {
      console.error('Error inserting department:', err);
      return res.status(500).json({ error: 'Failed to add department' });
    }
    
    const dept_ID = result.insertId;
    
    // Insert into contents table for each existing task
    const insertContentQuery = 'INSERT INTO contents (dept_ID, task_ID) SELECT ?, task_ID FROM tasks';
    
    db.query(insertContentQuery, [dept_ID], (err) => {
      if (err) {
        console.error('Error inserting into contents table:', err);
        return res.status(500).json({ error: 'Failed to update contents' });
      }
      
      res.status(201).json({ message: 'Department added and contents updated successfully' });
    });
  });
});

// Get all departments
app.get('/departments', (req, res) => {
  const sql = 'SELECT * FROM department';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


// Endpoint to insert a new task
app.post('/tasks', async (req, res) => {
    const { title, due_date, content } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const [result] = await promisePool.query(
            'INSERT INTO tasks (title, due_date, content) VALUES (?, ?, ?)',
            [title, due_date, content]
        );

        res.status(201).json({
            id: result.insertId,
            title,
            due_date,
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while inserting the task' });
    }
});

app.post('/addtasks', upload.array('attachments'), (req, res) => {
  const { title, dueDate, content } = req.body;

  if (!title || !dueDate || !content) {
    return res.status(400).json({ error: 'Title, Due Date, and Content are required' });
  }

  // Ensure attachments are handled properly
  const attachments = req.files ? req.files.map(file => ({
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
    uri: file.path,
  })) : [];

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection error:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    connection.beginTransaction(err => {
      if (err) {
        console.error('Transaction error:', err);
        connection.release();
        return res.status(500).json({ error: 'Transaction error' });
      }

      const taskQuery = 'INSERT INTO tasks (title, due_date, content) VALUES (?, ?, ?)';
      connection.query(taskQuery, [title, dueDate, content], (taskErr, taskResult) => {
        if (taskErr) {
          connection.rollback(() => {
            connection.release();
            console.error('Error creating task:', taskErr);
            return res.status(500).json({ error: 'Failed to create task' });
          });
        }

        const taskId = taskResult.insertId;

        if (attachments.length === 0) {
          connection.commit(err => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                console.error('Commit error:', err);
                return res.status(500).json({ error: 'Transaction commit error' });
              });
            }
            connection.release();
            res.status(201).json({ message: 'Task created successfully without attachments', taskId });
          });
        } else {
          const fileQueries = attachments.map(attachment => {
            return new Promise((resolve, reject) => {
              const fileQuery = 'INSERT INTO files (task_ID, file_name, size, type, url) VALUES (?, ?, ?, ?, ?)';
              connection.query(
                fileQuery,
                [taskId, attachment.name, attachment.size, attachment.type, attachment.uri],
                (fileErr, fileResult) => {
                  if (fileErr) {
                    return reject(fileErr);
                  }
                  resolve(fileResult);
                }
              );
            });
          });

          Promise.all(fileQueries)
            .then(() => {
              connection.commit(err => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    console.error('Commit error:', err);
                    return res.status(500).json({ error: 'Transaction commit error' });
                  });
                }
                connection.release();
                res.status(201).json({ message: 'Task and attachments created successfully', taskId });
              });
            })
            .catch(fileErr => {
              connection.rollback(() => {
                connection.release();
                console.error('Error creating file records:', fileErr);
                return res.status(500).json({ error: 'Failed to create file records' });
              });
            });
        }
      });
    });
  });
});



// Get all tasks
app.get('/tasks', (req, res) => {
  const sql = 'SELECT * FROM tasks';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Add a new file
app.post('/addFile', (req, res) => {
  const { task_ID, file_name, size, type, url } = req.body;
  const sql = 'INSERT INTO files (task_ID, file_name, size, type, url) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [task_ID, file_name, size, type, url], (err, result) => {
    if (err) throw err;
    res.send('File added');
  });
});

// Get files by task ID
app.get('/files/:task_ID', (req, res) => {
  const task_ID = req.params.task_ID;
  const sql = 'SELECT * FROM files WHERE task_ID = ?';
  db.query(sql, [task_ID], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// File upload endpoint
app.post('/api/files', upload.single('file'), (req, res) => {
  // Check if file is uploaded
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // File info
  const fileInfo = {
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
  };

  res.status(200).json({
    message: 'File uploaded successfully',
    file: fileInfo,
  });
});

/* Add new content
app.post('/addContent', (req, res) => {
  const { dept_ID, task_ID } = req.body;
  const sql = 'INSERT INTO contents (dept_ID, task_ID) VALUES (?, ?)';
  db.query(sql, [dept_ID, task_ID], (err, result) => {
    if (err) throw err;
    res.send('Content added');
  });
});*/

/* Get content by ID
app.get('/content/:content_ID', (req, res) => {
  const content_ID = req.params.content_ID;
  const sql = 'SELECT * FROM contents WHERE content_ID = ?';
  db.query(sql, [content_ID], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Content not found');
    }
  });
});*/

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'proftal2024@gmail.com', // your email
    pass: 'ytkj saab gnkb cxwa',  // the application-specific password
  },
});

// Endpoint to handle sending OTP
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  const otp = crypto.randomInt(100000, 999999).toString();

  const mailOptions = {
    from: 'proftal2024@gmail.com',
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP for password reset is ${otp}`,
  };

  db.query('SELECT user_ID FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(400).send({ success: false, message: 'Email not registered' });
    }

    const userId = results[0].user_ID;
    if (!userId) {
      return res.status(500).send({ success: false, message: 'User ID not found' });
    }

    db.query('INSERT INTO OTP (otp, user_ID) VALUES (?, ?)', [otp, userId], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).send(error.toString());
        }
        res.send({ success: true, message: 'OTP sent to email' });
      });
    });
  });
});


// Endpoint to handle password reset
app.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Check OTP
    const [results] = await db.promise().query('SELECT u.user_ID FROM users u JOIN OTP o ON u.user_ID = o.user_ID WHERE u.email = ? AND o.otp = ?', [email, otp]);
    if (results.length === 0) {
      return res.status(400).send({ success: false, message: 'Invalid OTP' });
    }

    const userId = results[0].user_ID;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database
    await db.promise().query('UPDATE users SET password = ? WHERE user_ID = ?', [hashedPassword, userId]);

    // Delete the OTP entry
    await db.promise().query('DELETE FROM OTP WHERE user_ID = ?', [userId]);

    res.send({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
  }
});

/* Endpoint to handle registration
app.post('/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send({ error: 'Internal server error' });
    }

    const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
    db.query(query, [firstName, lastName, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).send({ error: 'Internal server error' });
      }
      res.send({ success: true, message: 'User registered successfully' });
    });
  });
});*/

/* Endpoint to handle registration
app.post('/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
  db.query(query, [firstName, lastName, email, password], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send({ success: true, message: 'Registration successful' });
  });
});*/

/* Endpoint to handle registration
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, dept_ID } = req.body;

  if (!firstName || !lastName || !email || !password || !dept_ID) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the email is already registered
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database
    const [result] = await db.promise().query(
      'INSERT INTO users (first_name, last_name, email, password, dept_ID) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, dept_ID]
    );

    // Generate a JWT token
    const token = jwt.sign({ id: result.insertId }, 'your_jwt_secret', {
      expiresIn: '1h',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token, // Send the token if you use JWT for authentication
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});*/

// Endpoint to fetch users pending approval
app.get('/pending-users', async (req, res) => {
  try {
    const [users] = await db.promise().query(`
      SELECT user_ID, 
             CONCAT(first_name, ' ', last_name) AS name, 
             role, 
             date_registered AS date 
      FROM users 
      WHERE status = ?`, ['pending']);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching pending users:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/rejected-users', async (req, res) => {
  try {
    const [users] = await db.promise().query(`
      SELECT user_ID, 
             CONCAT(first_name, ' ', last_name) AS name, 
             role, 
             date_registered AS date 
      FROM users 
      WHERE status = ?`, ['rejected']);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching rejected users:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Endpoint to approve the account
app.put('/approve-user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await db.promise().query('UPDATE users SET status = "approved" WHERE user_ID = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Endpoint to reject the account
app.put('/reject-user/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await db.promise().query('UPDATE users SET status = "rejected" WHERE user_ID = ?', [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User rejected successfully' });
  } catch (error) {
    console.error('Error rejecting user:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


app.post('/send-approval-email', (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: 'proftal2024@gmail.com',
    to: email,
    subject: 'Account Approved',
    text: 'Your account has been approved and you can now log in.',
  };

  db.query('SELECT user_ID FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(400).send({ success: false, message: 'Email not registered' });
    }

    const userId = results[0].user_ID;
    if (!userId) {
      return res.status(500).send({ success: false, message: 'User ID not found' });
    }

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Approval email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send approval email' });
    }
  });
});


app.post('/send-rejection-email', (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: 'proftal2024@gmail.com', // Replace with your email
    to: email,
    subject: 'Account Rejected',
    text: 'Unfortunately, your account has been rejected. If you have any questions, please contact support.',
  };

  db.query('SELECT user_ID FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(400).send({ success: false, message: 'Email not registered' });
    }

    const userId = results[0].user_ID;
    if (!userId) {
      return res.status(500).send({ success: false, message: 'User ID not found' });
    }

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Rejection email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send rejection email' });
    }
  });
});

// Endpoint to handle registration
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, dept_ID } = req.body;

  if (!firstName || !lastName || !email || !password || !dept_ID) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Log for debugging
    console.log('SaltRounds:', saltRounds);

    // Check if the email is already registered
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database with a status indicating pending approval
    const [result] = await db.promise().query(
      'INSERT INTO users (first_name, last_name, email, password, dept_ID, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, dept_ID, 'Teacher', 'pending']
    );

    res.status(201).json({
      message: 'User registered successfully, pending admin approval',
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


// Endpoint to handle login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Received login request for email/username: ${email}`);

  // Check if input is a valid email or assume it's a username
  const loginField = isValidEmail(email) ? 'email' : 'username';

  // First, check if the user is an admin
  const adminQuery = `SELECT * FROM admin WHERE ${loginField} = ?`;
  db.query(adminQuery, [email], (adminErr, adminResults) => {
    if (adminErr) {
      console.error('Error during admin login:', adminErr);
      return res.status(500).send({ error: 'Internal server error' });
    }
    if (adminResults.length > 0) {
      console.log('Admin user found:', adminResults[0]);
      // Admin password is not hashed
      if (password === adminResults[0].password) {
        console.log('Admin login successful');
        // If an admin user is found, return success with role as 'admin'
        return res.send({ success: true, role: 'admin', message: 'Admin login successful' });
      } else {
        console.log('Invalid admin credentials');
        return res.send({ success: false, message: 'Invalid credentials' });
      }
    } else {
      console.log('No admin user found, checking regular users');
      // If not an admin, check in the users table
      const userQuery = `SELECT * FROM users WHERE ${loginField} = ?`;
      db.query(userQuery, [email], (userErr, userResults) => {
        if (userErr) {
          console.error('Error during user login:', userErr);
          return res.status(500).send({ error: 'Internal server error' });
        }
        if (userResults.length > 0) {
          console.log('Regular user found:', userResults[0]);
          // Compare hashed password
          bcrypt.compare(password, userResults[0].password, (err, isMatch) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              return res.status(500).send({ error: 'Internal server error' });
            }
            if (isMatch) {
              console.log('User login successful');
              // If a regular user is found, return success with the user's role
              return res.send({ success: true, role: userResults[0].role, message: 'Login successful' });
            } else {
              console.log('Invalid user credentials');
              return res.send({ success: false, message: 'Invalid credentials' });
            }
          });
        } else {
          console.log('No user found with that email/username');
          // If no user is found, return an error
          return res.send({ success: false, message: 'Invalid credentials' });
        }
      });
    }
  });
});
/* Endpoint to handle login
app.post('/login-user', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      res.send({ success: true, message: 'Login successful' });
    } else {
      res.send({ success: false, message: 'Invalid credentials' });
    }
  });
});*/

/*Endpoint to handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).send({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.send({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send({ error: 'Internal server error' });
      }
      if (isMatch) {
        res.send({ success: true, message: 'Login successful' });
      } else {
        res.send({ success: false, message: 'Invalid credentials' });
      }
    });
  });
});*/

/* Endpoint to handle admin login
app.post('/login-admin', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM admin WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error during admin login:', err);
      return res.status(500).send({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.send({ success: true, message: 'Admin login successful' });
    } else {
      res.send({ success: false, message: 'Invalid credentials' });
    }
  });
});*/

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

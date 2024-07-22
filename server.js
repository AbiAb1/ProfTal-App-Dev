const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    let originalName = file.originalname;
    let ext = path.extname(originalName);
    let baseName = path.basename(originalName, ext);
    let uniqueName = originalName;
    let counter = 1;

    while (fs.existsSync(path.join(uploadsDir, uniqueName))) {
      uniqueName = `${baseName}(${counter})${ext}`;
      counter++;
    }

    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'proftal'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT userID, username FROM useracc WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      const { userID, username } = results[0];
      res.status(200).json({ message: 'Login successful', userID, username });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

// Fetch all feed content
app.get('/feedcontent', (req, res) => {
  const query = 'SELECT contentid, title, captions FROM feedcontent';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching feed content:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json(results);
  });
});

// Fetch submitted documents where Status is 1
app.get('/submittedDocuments/:userID/:contentID/:taskID', (req, res) => {
  const { userID, contentID, taskID } = req.params;
  const query = 'SELECT * FROM documents WHERE UserID = ? AND ContentID = ? AND TaskID = ? AND Status = 1';

  db.query(query, [userID, contentID, taskID], (err, results) => {

    res.status(200).json(results);
  });
});

// Fetch unsubmitted documents where Status is 0
app.get('/unsubmittedDocuments/:userID/:contentID/:taskID', (req, res) => {
  const { userID, contentID, taskID } = req.params;
  const query = 'SELECT * FROM documents WHERE UserID = ? AND ContentID = ? AND TaskID = ? AND Status = 0';

  db.query(query, [userID, contentID, taskID], (err, results) => {
    if (results.length === 0) {
      return res.status(404).json({ error: 'No unsubmitted documents found for the provided IDs' });
    }

    res.status(200).json(results);
  });
});

// Insert documents endpoint
app.post('/insertDocuments', upload.array('documents'), (req, res) => {
  const { UserID, ContentID, TaskID } = req.body;
  const files = req.files;

  // Check if UserID, ContentID, TaskID are provided and files exist
  if (!UserID || !ContentID || !TaskID) {
    return res.status(400).json({ error: 'Invalid request body: UserID, ContentID, TaskID are required' });
  }

  // Update unsubmitted documents' status to 1
  const updateQuery = 'UPDATE documents SET Status = 1 WHERE UserID = ? AND ContentID = ? AND TaskID = ? AND Status = 0';
  db.query(updateQuery, [UserID, ContentID, TaskID], (updateErr, updateResults) => {
    if (updateErr) {
      console.error('Error updating document status:', updateErr);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Check if files were attached
    if (!files || files.length === 0) {
      // No files attached, respond with success message
      return res.status(200).json({ message: 'No documents attached, but metadata updated successfully' });
    }

    // Prepare data for insertion
    const insertQueries = files.map(file => [
      UserID,
      ContentID,
      TaskID,
      file.originalname,
      file.mimetype,
      file.size,
      file.path,
      1  // Set Status flag to 1 when inserting
    ]);

    const insertQuery = 'INSERT INTO documents (UserID, ContentID, TaskID, name, mimeType, size, uri, Status) VALUES ?';

    db.query(insertQuery, [insertQueries], (insertErr, insertResults) => {
      if (insertErr) {
        console.error('Error inserting documents:', insertErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(200).json({ message: 'Documents inserted successfully' });
    });
  });
});



// Endpoint for unsubmitting documents and updating task status
// Endpoint for unsubmitting documents and updating task status
app.put('/unsubmitDocument', (req, res) => {
  const { UserID, ContentID, TaskID } = req.body;

  const query = 'UPDATE documents SET Status = 0 WHERE UserID = ? AND ContentID = ? AND TaskID = ?';

  db.query(query, [UserID, ContentID, TaskID], (err, results) => {
    if (err) {
      console.error('Error unsubmitting document:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Document not found or not updated' });
    }

    res.status(200).json({ message: 'Document successfully unsubmitted' });
  });
});





// Fetch tasks for a specific content
app.get('/tasks/:contentId', (req, res) => {
  const { contentId } = req.params;
  const query = 'SELECT * FROM tasks WHERE ContentID = ?';

  db.query(query, [contentId], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No tasks found for the provided content ID' });
    }

    res.status(200).json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

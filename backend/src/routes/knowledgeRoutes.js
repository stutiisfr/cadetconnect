const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// List Notes in Defence Knowledge Hub
router.get('/', (req, res) => {
  const { category, subject, search } = req.query;
  let notes = db.find('notes');

  if (category && category !== 'All') {
    notes = notes.filter(n => n.category === category);
  }
  if (subject && subject !== 'All') {
    notes = notes.filter(n => n.subject === subject);
  }
  if (search) {
    const q = search.toLowerCase();
    notes = notes.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.description.toLowerCase().includes(q) || 
      (n.subject && n.subject.toLowerCase().includes(q))
    );
  }

  return res.json({ success: true, count: notes.length, notes });
});

// Upload Note / Study Material
router.post('/upload', verifyToken, (req, res) => {
  const { title, category, subject, description, fileUrl, fileSize, format } = req.body;
  if (!title || !category || !description) {
    return res.status(400).json({ success: false, error: 'Title, category, and description are required.' });
  }

  const user = db.findOne('users', u => u.id === req.user.id);
  const note = db.insert('notes', {
    title,
    authorId: user.id,
    authorName: user.name,
    category,
    subject: subject || 'General Study',
    description,
    downloadUrl: fileUrl || '#',
    rating: 5.0,
    downloadsCount: 0,
    fileSize: fileSize || '2.5 MB',
    format: format || 'PDF'
  });

  return res.status(201).json({ success: true, message: 'Note uploaded to Knowledge Hub.', note });
});

// Download Note Counter
router.post('/:id/download', (req, res) => {
  const note = db.findOne('notes', n => n.id === req.params.id);
  if (!note) return res.status(404).json({ success: false, error: 'Note not found.' });

  const downloadsCount = (note.downloadsCount || 0) + 1;
  db.update('notes', n => n.id === req.params.id, { downloadsCount });

  return res.json({ success: true, downloadsCount, downloadUrl: note.downloadUrl || '#' });
});

module.exports = router;

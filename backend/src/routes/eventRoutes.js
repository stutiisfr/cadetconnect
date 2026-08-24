const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// List Events
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let events = db.find('events');

  if (category && category !== 'All') {
    events = events.filter(e => e.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    events = events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
  }

  return res.json({ success: true, count: events.length, events });
});

// Event Detail
router.get('/:id', (req, res) => {
  const evt = db.findOne('events', e => e.id === req.params.id);
  if (!evt) return res.status(404).json({ success: false, error: 'Event not found.' });

  const registrations = db.find('event_registrations', r => r.eventId === evt.id);

  return res.json({
    success: true,
    event: evt,
    registrationsCount: registrations.length || evt.participantsCount
  });
});

// Register for Event
router.post('/:id/register', verifyToken, (req, res) => {
  const evtId = req.params.id;
  const evt = db.findOne('events', e => e.id === evtId);
  if (!evt) return res.status(404).json({ success: false, error: 'Event not found.' });

  const existing = db.findOne('event_registrations', r => r.eventId === evtId && r.userId === req.user.id);
  if (existing) {
    return res.json({ success: true, message: 'You are already registered for this event.' });
  }

  db.insert('event_registrations', {
    eventId: evtId,
    userId: req.user.id,
    registeredAt: new Date().toISOString()
  });

  db.update('events', e => e.id === evtId, { participantsCount: (evt.participantsCount || 0) + 1 });

  return res.json({ success: true, message: 'Registration confirmed for event.' });
});

// Create Event
router.post('/create', verifyToken, (req, res) => {
  const { title, category, date, time, location, organizer, description, eligibility, banner, maxParticipants } = req.body;
  if (!title || !date || !location) {
    return res.status(400).json({ success: false, error: 'Title, date, and location are required.' });
  }

  const evt = db.insert('events', {
    title,
    category: category || 'NCC Camp',
    date,
    time: time || '09:00 AM',
    location,
    organizer: organizer || req.user.name,
    description: description || '',
    eligibility: eligibility || 'All Cadets & Aspirants',
    banner: banner || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80',
    participantsCount: 0,
    maxParticipants: maxParticipants || 200,
    creatorId: req.user.id
  });

  return res.status(201).json({ success: true, event: evt });
});

module.exports = router;

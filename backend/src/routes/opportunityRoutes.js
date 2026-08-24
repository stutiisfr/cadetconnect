const express = require('express');
const db = require('../db/database');

const router = express.Router();

// List Opportunities
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let opps = db.find('opportunities');

  if (category && category !== 'All') {
    opps = opps.filter(o => o.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    opps = opps.filter(o => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
  }

  return res.json({ success: true, count: opps.length, opportunities: opps });
});

module.exports = router;

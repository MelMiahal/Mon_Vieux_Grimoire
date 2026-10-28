const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur Mon Vieux Grimoire' });
});

router.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;

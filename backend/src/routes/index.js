const express = require('express');
const authRoutes = require('./authRoutes');
const bookRoutes = require('./bookRoutes');

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/books', bookRoutes);

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur Mon Vieux Grimoire' });
});

router.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;

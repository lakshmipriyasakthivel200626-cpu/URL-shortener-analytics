const express = require('express');
const router = express.Router();
const { shortenUrl, getUserUrls, deleteUrl, getUrlAnalytics } = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');

router.post('/shorten', protect, shortenUrl);
router.get('/', protect, getUserUrls);
router.delete('/:id', protect, deleteUrl);
router.get('/:id/analytics', protect, getUrlAnalytics);

module.exports = router;

const express = require('express');
const router = express.Router();

const Url = require('../models/Url'); // ✅ import model

const {
    shortenUrl,
    getUserUrls,
    deleteUrl,
    getUrlAnalytics
} = require('../controllers/urlController');

const { protect } = require('../middleware/authMiddleware');


// 🔐 Protected Routes
router.post('/shorten', protect, shortenUrl);
router.get('/', protect, getUserUrls);
router.delete('/:id', protect, deleteUrl);
router.get('/:id/analytics', protect, getUrlAnalytics);


// 🔥 IMPORTANT: PUBLIC REDIRECT ROUTE (NO AUTH)
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const url = await Url.findOne({ shortCode: code });

        if (!url) {
            return res.status(404).send("URL not found");
        }

        // ✅ Increase clicks ONLY HERE
        url.clicks += 1;

        // ✅ Store visit history
        url.visitHistory.push({
            timestamp: new Date(),
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });

        await url.save();

        // ✅ Redirect to original URL
        return res.redirect(url.originalUrl);

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
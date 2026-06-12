const Url = require('../models/Url');
const Visit = require('../models/Visit');
const useragent = require('useragent');

// Helper to generate a unique 6-character short code
const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to parse browser, OS, and device type from User-Agent header
const parseVisitorSpecs = (uaString) => {
  if (!uaString) {
    return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  }
  
  const agent = useragent.parse(uaString);
  const browser = agent.family || 'Unknown';
  const os = agent.os.family || 'Unknown';
  
  let device = 'Desktop';
  const uaLower = uaString.toLowerCase();
  if (/ipad|tablet/i.test(uaLower)) {
    device = 'Tablet';
  } else if (/mobile|android|iphone|ipod|phone/i.test(uaLower)) {
    device = 'Mobile';
  }
  
  return { browser, os, device };
};

// @desc    Shorten a URL
// @route   POST /api/urls/shorten
// @access  Private
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Please provide a long URL to shorten' });
    }

    // Format the URL - auto add http if missing (nice UX!)
    let urlToSave = originalUrl.trim();
    if (!/^https?:\/\//i.test(urlToSave)) {
      urlToSave = 'http://' + urlToSave;
    }

    // Validate the URL structure
    try {
      new URL(urlToSave);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL structure' });
    }

    // Generate unique code & resolve collisions
    let shortCode = generateShortCode();
    let codeExists = await Url.findOne({ shortCode });
    let safetyCounter = 0;
    
    while (codeExists && safetyCounter < 10) {
      shortCode = generateShortCode();
      codeExists = await Url.findOne({ shortCode });
      safetyCounter++;
    }

    const baseUrl = req.protocol + '://' + req.get('host');
    const shortUrl = `${baseUrl}/${shortCode}`;

    const newUrl = await Url.create({
      originalUrl: urlToSave,
      shortCode,
      shortUrl,
      userId: req.user._id
    });

    return res.status(201).json(newUrl);
  } catch (error) {
    console.error('URL Shortening Error:', error);
    return res.status(500).json({ message: 'Server error, could not shorten URL' });
  }
};

// @desc    Get all URLs for logged-in user
// @route   GET /api/urls
// @access  Private
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(urls);
  } catch (error) {
    console.error('Fetch URLs Error:', error);
    return res.status(500).json({ message: 'Server error, could not fetch URLs' });
  }
};

// @desc    Delete a shortened URL & cascade delete visit history
// @route   DELETE /api/urls/:id
// @access  Private
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Check ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this URL' });
    }

    // Use deleteOne to trigger removal
    await Url.deleteOne({ _id: url._id });
    
    // Cascading delete visits log to clean up database!
    await Visit.deleteMany({ urlId: url._id });

    return res.json({ message: 'URL and its analytics history deleted successfully' });
  } catch (error) {
    console.error('Delete URL Error:', error);
    return res.status(500).json({ message: 'Server error, could not delete URL' });
  }
};

// @desc    Redirect short URL and log visit analytics
// @route   GET /:code
// @access  Public
const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;
    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      // Return a clean error HTML page for user experience or send 404
      return res.status(404).send(`
        <html>
          <head>
            <title>404 - Link Not Found</title>
            <style>
              body { font-family: -apple-system, sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc; }
              h1 { color: #ef4444; }
              p { color: #94a3b8; font-size: 1.1em; }
              a { color: #3b82f6; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Link Not Found</h1>
            <p>The short URL code you requested is expired, invalid, or was deleted.</p>
            <p><a href="/">Go to Homepage</a></p>
          </body>
        </html>
      `);
    }

    // 1. Increment click counter
    url.clicks += 1;
    await url.save();

    // 2. Parse request headers for visitor analysis
    const userAgentStr = req.headers['user-agent'];
    const { browser, os, device } = parseVisitorSpecs(userAgentStr);
    
    // Capture IP Address (taking proxies into account)
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

    // 3. Log the visit (fire-and-forget in background)
    await Visit.create({
      urlId: url._id,
      ipAddress,
      userAgent: userAgentStr,
      browser,
      os,
      device
    });

    // 4. Redirect to the target URL. 
    // Using a 302 Found redirect tells browsers not to cache the redirect locally,
    // ensuring subsequent clicks are hitting our server and logged for analytics.
    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error('URL Redirection Error:', error);
    return res.status(500).send('Server error, could not redirect.');
  }
};

// @desc    Get detailed URL analytics data for visual dashboards
// @route   GET /api/urls/:id/analytics
// @access  Private
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Validate ownership
    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view analytics' });
    }

    // Fetch visits sorted newest first
    const visits = await Visit.find({ urlId: url._id }).sort({ timestamp: -1 });

    // Build charts groupings
    const browserData = {};
    const osData = {};
    const deviceData = {};
    const trendData = {};

    visits.forEach((v) => {
      // Browser
      browserData[v.browser] = (browserData[v.browser] || 0) + 1;
      
      // OS
      osData[v.os] = (osData[v.os] || 0) + 1;
      
      // Device
      deviceData[v.device] = (deviceData[v.device] || 0) + 1;
      
      // Date Trend (e.g., YYYY-MM-DD)
      const dateStr = v.timestamp.toISOString().split('T')[0];
      trendData[dateStr] = (trendData[dateStr] || 0) + 1;
    });

    // Convert objects to array formats for charting plugins (e.g., Recharts)
    const browsers = Object.keys(browserData).map((name) => ({ name, value: browserData[name] }));
    const os = Object.keys(osData).map((name) => ({ name, value: osData[name] }));
    const devices = Object.keys(deviceData).map((name) => ({ name, value: deviceData[name] }));
    
    // Sort trends sequentially by date string
    const trends = Object.keys(trendData)
      .map((date) => ({ date, clicks: trendData[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Keep the last 7 active click days

    return res.json({
      clicks: url.clicks,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      createdAt: url.createdAt,
      lastVisited: visits[0] ? visits[0].timestamp : null,
      recentHistory: visits.slice(0, 10), // Limit history grid to last 10 entries
      stats: {
        browsers,
        os,
        devices,
        trends
      }
    });
  } catch (error) {
    console.error('URL Analytics Fetch Error:', error);
    return res.status(500).json({ message: 'Server error, could not fetch analytics' });
  }
};

module.exports = {
  shortenUrl,
  getUserUrls,
  deleteUrl,
  redirectUrl,
  getUrlAnalytics
};

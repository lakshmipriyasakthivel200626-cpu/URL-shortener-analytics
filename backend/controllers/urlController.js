const Url = require('../models/Url');
const Visit = require('../models/Visit');
const useragent = require('useragent');


// 🔹 Generate short code
const generateShortCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};


// 🔹 Parse user device info
const parseVisitorSpecs = (uaString) => {
  if (!uaString) {
    return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  }

  const agent = useragent.parse(uaString);

  let device = 'Desktop';
  const uaLower = uaString.toLowerCase();

  if (/ipad|tablet/i.test(uaLower)) device = 'Tablet';
  else if (/mobile|android|iphone|phone/i.test(uaLower)) device = 'Mobile';

  return {
    browser: agent.family || 'Unknown',
    os: agent.os.family || 'Unknown',
    device
  };
};


// 🔥 SHORTEN URL
const shortenUrl = async (req, res) => {
  try {
    let { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'URL required' });
    }

    originalUrl = originalUrl.trim();

    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = 'http://' + originalUrl;
    }

    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    let shortCode;
    let exists;

    do {
      shortCode = generateShortCode();
      exists = await Url.findOne({ shortCode });
    } while (exists);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${shortCode}`;

    const newUrl = await Url.create({
      originalUrl,
      shortCode,
      shortUrl,
      userId: req.user._id
    });

    res.status(201).json(newUrl);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// 🔥 GET USER URLS (NO CLICK CHANGE)
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(urls);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching URLs' });
  }
};


// 🔥 DELETE URL
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) return res.status(404).json({ message: 'Not found' });

    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Url.deleteOne({ _id: url._id });
    await Visit.deleteMany({ urlId: url._id });

    res.json({ message: 'Deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};


// 🔥 🔥 MAIN FIX: REDIRECT ONLY HERE INCREASES CLICKS
const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).send("Link not found");
    }

    // ✅ ONLY PLACE WHERE CLICKS INCREASE
    url.clicks += 1;
    await url.save();

    const ua = req.headers['user-agent'];
    const { browser, os, device } = parseVisitorSpecs(ua);

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await Visit.create({
      urlId: url._id,
      ipAddress: ip,
      userAgent: ua,
      browser,
      os,
      device
    });

    return res.redirect(302, url.originalUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send('Redirect error');
  }
};


// 🔥 ANALYTICS (NO CLICK CHANGE)
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) return res.status(404).json({ message: 'Not found' });

    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const visits = await Visit.find({ urlId: url._id })
      .sort({ timestamp: -1 });

    const browserData = {};
    const osData = {};
    const deviceData = {};
    const trendData = {};

    visits.forEach(v => {
      browserData[v.browser] = (browserData[v.browser] || 0) + 1;
      osData[v.os] = (osData[v.os] || 0) + 1;
      deviceData[v.device] = (deviceData[v.device] || 0) + 1;

      const date = v.timestamp.toISOString().split('T')[0];
      trendData[date] = (trendData[date] || 0) + 1;
    });

    res.json({
      clicks: url.clicks,
      lastVisited: visits[0]?.timestamp || null,
      recentHistory: visits.slice(0, 10),
      stats: {
        browsers: Object.entries(browserData).map(([name, value]) => ({ name, value })),
        os: Object.entries(osData).map(([name, value]) => ({ name, value })),
        devices: Object.entries(deviceData).map(([name, value]) => ({ name, value })),
        trends: Object.entries(trendData)
          .map(([date, clicks]) => ({ date, clicks }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(-7)
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Analytics error' });
  }
};


module.exports = {
  shortenUrl,
  getUserUrls,
  deleteUrl,
  redirectUrl,
  getUrlAnalytics
};
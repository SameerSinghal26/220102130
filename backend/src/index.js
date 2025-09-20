import express from "express";
import { nanoid } from "nanoid";
import validator from "validator";
import cors from "cors";
import loggingMiddleware from "./middleware/loggingMiddleware.js";

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";

app.use(express.json());
app.use(cors());
app.use(loggingMiddleware('http://localhost:3000'));

const urlDatabase = new Map();

const getLocationFromClientIP = (ip) => {
  return "Unknown Location";
};


const trackUrlClick = async (shortcode, req) => {
  if (!urlDatabase.has(shortcode)) {
    return false;
  }
  
  const urlData = urlDatabase.get(shortcode);
  
  if (!urlData.clicks) {
    urlData.clicks = [];
  }
  
  const clickData = {
    timestamp: new Date().toISOString(),
    referrer: req.get('Referrer') || 'Direct',
    location: getLocationFromClientIP(req.ip),
    userAgent: req.get('User-Agent')
  };
  
  urlData.clicks.push(clickData);
  urlDatabase.set(shortcode, urlData);
  
  if (req.logger) {
    await req.logger('backend', 'info', 'click-tracking', `Click tracked for ${shortcode}: referrer=${clickData.referrer}, location=${clickData.location}`);
  }
  
  return true;
};


const createShortcode = (customCode) => {
  if (customCode) {
    if (urlDatabase.has(customCode)) {
      return null;
    }
    return customCode;
  }

  
  let shortcode;
  do {
    shortcode = nanoid(5); 
  } while (urlDatabase.has(shortcode));

  return shortcode;
};


const validateUrlFormat = (url) => {
  return validator.isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
  });
};


app.post("/shorturls", async (req, res) => {
  const { url, validity, shortcode } = req.body;

  await req.logger('backend', 'info', 'url-shortener', `URL shortening request: ${url}, custom shortcode: ${shortcode || 'none'}`);

  if (!url) {
    await req.logger('backend', 'warn', 'validation', 'URL shortening failed: URL is required');
    return res.status(400).json({ error: "URL is required" });
  }

  if (!validateUrlFormat(url)) {
    await req.logger('backend', 'warn', 'validation', `URL shortening failed: Invalid URL format - ${url}`);
    return res.status(400).json({ error: "Invalid URL format" });
  }

  const generatedShortcode = createShortcode(shortcode);

  if (shortcode && !generatedShortcode) {
    await req.logger('backend', 'warn', 'conflict', `URL shortening failed: Shortcode already in use - ${shortcode}`);
    return res
      .status(409)
      .json({ error: "Requested shortcode is already in use" });
  }

  const validitytime = validity || 30; 
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + validitytime);

  urlDatabase.set(generatedShortcode, {
    originalUrl: url,
    expiry: expiryDate,
    createdAt: new Date().toISOString(),
    clicks: []
  });

  const shortLink = `http://${HOST}:${PORT}/${generatedShortcode}`;

  await req.logger('backend', 'info', 'url-shortener', `URL shortened successfully: ${url} -> ${shortLink}, expires: ${expiryDate.toISOString()}`);

  res.status(201).json({
    shortLink,
    expiry: expiryDate.toISOString(),
  });
});


app.get("/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  await req.logger('backend', 'info', 'redirect', `Redirect request for shortcode: ${shortcode}`);

  if (!urlDatabase.has(shortcode)) {
    await req.logger('backend', 'warn', 'redirect', `Redirect failed: Short link not found - ${shortcode}`);
    return res.status(404).json({ error: "Short link not found" });
  }

  const urlData = urlDatabase.get(shortcode);

  if (new Date() > new Date(urlData.expiry)) {
    urlDatabase.delete(shortcode);
    await req.logger('backend', 'warn', 'redirect', `Redirect failed: Short link expired - ${shortcode}`);
    return res.status(410).json({ error: "Short link has expired" });
  }

  await trackUrlClick(shortcode, req);

  await req.logger('backend', 'info', 'redirect', `Successful redirect: ${shortcode} -> ${urlData.originalUrl}`);

  res.redirect(urlData.originalUrl);
});

app.get("/shorturls/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  await req.logger('backend', 'info', 'analytics', `Analytics request for shortcode: ${shortcode}`);

  if (!urlDatabase.has(shortcode)) {
    await req.logger('backend', 'warn', 'analytics', `Analytics failed: Short link not found - ${shortcode}`);
    return res.status(404).json({ error: "Short link not found" });
  }

  const urlData = urlDatabase.get(shortcode);

  if (new Date() > new Date(urlData.expiry)) {
    urlDatabase.delete(shortcode);
    await req.logger('backend', 'warn', 'analytics', `Analytics failed: Short link expired - ${shortcode}`);
    return res.status(410).json({ error: "Short link has expired" });
  }

  const stats = {
    shortcode,
    totalClicks: urlData.clicks ? urlData.clicks.length : 0,
    originalUrl: urlData.originalUrl,
    createdAt: urlData.createdAt,
    expiry: urlData.expiry,
    clickData: urlData.clicks || []
  };

  await req.logger('backend', 'info', 'analytics', `Analytics retrieved for ${shortcode}: ${stats.totalClicks} clicks`);

  res.json(stats);
});


app.get("/", (req, res) => {
  res.send("URL Shortener API");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
// File: routes/summarize.js
const express = require('express');
const validator = require('validator');
const crypto = require('crypto');
const fetchContent = require('../fetchContent');
const { getEmbeddings, summarizeChunks } = require('../openai');
const { splitTextIntoChunks } = require('../splitTextIntoChunks');
const { identifyImportantChunks, combineSummaries } = require('../helpers');
const jwtAuth = require('../middlewares/jwtAuth');
const limiter = require('../middlewares/rateLimiter');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache for 1 hour

// Function to generate a hash key
function generateHashKey(url) {
    return crypto.createHash('sha256').update(url).digest('hex');
}

// Middleware for JWT authentication
router.use(jwtAuth);

// Middleware for rate limiting
router.use(limiter);

// Validate URL and check cache
router.use('/summarize', (req, res, next) => {
    const { url } = req.body;
    if (!url || !validator.isURL(url)) {
        return res.status(400).send('Valid URL parameter is required');
    }
    const key = generateHashKey(url);
    const cachedSummary = cache.get(key);
    if (cachedSummary) {
        return res.send(cachedSummary);
    }
    next();
});

// Fetch content, process it, and cache the summary
router.post('/summarize', async (req, res, next) => {
    try {
        const { url = 'http://www.example.com' } = req.body;
        const content = await fetchContent(url);
        const chunks = splitTextIntoChunks(content);
        const embeddings = await getEmbeddings(chunks);
        const importantChunks = identifyImportantChunks(chunks, embeddings);
        const summaries = await summarizeChunks(importantChunks);
        const combinedSummaries = combineSummaries(summaries);

        const key = generateHashKey(url);
        cache.set(key, combinedSummaries); // Cache the result

        res.send(combinedSummaries);
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

module.exports = router;

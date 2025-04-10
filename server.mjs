import express from 'express';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 10000;

app.get('/bypass', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ success: false, error: 'Missing url parameter' });

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Go to site and inject BotChallenger
        await page.goto('https://rip.linkvertise.lol', { waitUntil: 'domcontentloaded' });
        await page.addScriptTag({ url: 'https://rip.linkvertise.lol/cdn/BotChallenger_CAPTCHA.js' });

        // Wait until BotChallenger is loaded
        await page.waitForFunction(() => window.__BotChallenger__?.getToken, { timeout: 10000 });

        // Get token from page context
        const token = await page.evaluate(() => {
            window.BCConfig.Hostname = "rip.linkvertise.lol";
            return window.__BotChallenger__.getToken()[0];
        });

        await browser.close();

        // Fetch the bypassed link
        const apiRes = await fetch(`https://bypassunlock.usk.lol/gw/bypass?url=${encodeURIComponent(targetUrl)}&tk=${token}`);
        const json = await apiRes.json();

        // Return EXACT API response
        res.status(200).json(json);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Bypass API is running on port ${port}`);
});

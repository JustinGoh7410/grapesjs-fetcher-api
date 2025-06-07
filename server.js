const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const urlLib = require('url');

const app = express();
const port = 3000;

async function fetchPageAndCss(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const content = await page.content();

  await browser.close();

  const $ = cheerio.load(content);

  $('script, noscript, style').remove();

  const cssLinks = [];
  $('link[rel="stylesheet"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href) cssLinks.push(href);
  });

  let combinedCss = '';
  for (const link of cssLinks) {
    try {
      const cssUrl = urlLib.resolve(url, link);
      const res = await axios.get(cssUrl);
      combinedCss += res.data + '\n';
    } catch (e) {}
  }

  const bodyHTML = $('body').html();

  return { html: bodyHTML, css: combinedCss };
}

app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send({ error: 'Missing url param' });

  try {
    const data = await fetchPageAndCss(url);
    res.send(data);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.use(express.static('public')); 

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

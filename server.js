const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const urlLib = require('url');
const cors = require('cors'); // ✅ 加上 CORS

const app = express();
const port = process.env.PORT || 3000;

// ✅ 启用 CORS
app.use(cors());

// 主抓取函数
async function fetchPageAndCss(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: puppeteer.executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });


  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

  const content = await page.content();
  await browser.close();

  const $ = cheerio.load(content);
  $('script, noscript, style').remove();

  const cssLinks = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) cssLinks.push(href);
  });

  let combinedCss = '';
  for (const link of cssLinks) {
    try {
      const cssUrl = urlLib.resolve(url, link);
      const res = await axios.get(cssUrl);
      combinedCss += res.data + '\n';
    } catch (e) {
      console.warn('CSS load error:', e.message);
    }
  }

  return { html: $('body').html(), css: combinedCss };
}

// 抓取 API 路由
app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send({ error: 'Missing url param' });

  try {
    const data = await fetchPageAndCss(url);
    res.send(data);
  } catch (err) {
    console.error('抓取错误:', err.message);
    res.status(500).send({ error: err.message });
  }
});

// 开启服务
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

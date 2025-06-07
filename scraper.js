const axios = require('axios');
const cheerio = require('cheerio');

// Function to extract the ID from data-querystring
async function extractIdFromUrl(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      validateStatus: (status) => status < 500,
    });

    if (response.status === 404) {
      console.warn(`⚠️ 404 Not Found: ${url}`);
      const match = url.match(/-([A-Z0-9]+)\.html$/i);
      return match ? match[1] : null;
    }

    const $ = cheerio.load(response.data);
    let cgid = null, cid = null, pid = null;

    $('[data-querystring]').each((i, el) => {
      const attr = $(el).attr('data-querystring');

      if (attr?.includes('cgid=') && !cgid) {
        const match = attr.match(/cgid=([^"&]+)/i);
        if (match) cgid = match[1];
      }

      if (attr?.includes('cid=') && !cid) {
        const match = attr.match(/cid=([^"&]+)/i);
        if (match) cid = match[1];
      }

      if (attr?.includes('pid=') && !pid) {
        const match = attr.match(/pid=([^"&]+)/i);
        if (match) pid = match[1];
      }
    });

    return cgid || cid || pid || null;

  } catch (error) {
    console.error(`❌ Error for ${url}: ${error.message}`);
    return null;
  }
}

// List of URLs to process
const urls = [
  "https://www.cartier.com/en-my/jewellery/bracelets/love/",
  "https://www.cartier.com/en-my/jewellery/rings/love/",
  "https://www.cartier.com/en-my/jewellery/necklaces/love/",
  "https://www.cartier.com/en-my/jewellery/earrings/love/",
  "https://www.cartier.com/en-my/jewellery/bracelets/juste-un-clou/",
  "https://www.cartier.com/en-my/jewellery/rings/juste-un-clou/",
  "https://www.cartier.com/en-my/jewellery/necklaces/juste-un-clou/",
  "https://www.cartier.com/en-my/jewellery/earrings/juste-un-clou/",
  "https://www.cartier.com/en-my/jewellery/bracelets/trinity/",
  "https://www.cartier.com/en-my/jewellery/rings/trinity/",
  "https://www.cartier.com/en-my/jewellery/necklaces/trinity/",
  "https://www.cartier.com/en-my/jewellery/earrings/trinity/"
];

// Run and display results
(async () => {
  const results = await Promise.all(
    urls.map(async (url) => {
      const id = await extractIdFromUrl(url);
      return { url, id };
    })
  );

  results.forEach(({ url, id }) => {
    console.log(`${url} -> ${id || 'Not Found'}`);
  });
})();

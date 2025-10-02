//FORWARD RATES

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const usd_urls = {
  eurusd: "https://www.fxempire.com/currencies/eur-usd/forward-rates",
  gbpusd: "https://www.fxempire.com/currencies/gbp-usd/forward-rates",
  audusd: "https://www.fxempire.com/currencies/aud-usd/forward-rates",
  nzdusd: "https://www.fxempire.com/currencies/nzd-usd/forward-rates",
  usdjpy: "https://www.fxempire.com/currencies/usd-jpy/forward-rates",
  usdchf: "https://www.fxempire.com/currencies/usd-chf/forward-rates",
  usdcad: "https://www.fxempire.com/currencies/usd-cad/forward-rates",
};

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results = {};

  for (const [pair, url] of Object.entries(usd_urls)) {
    console.log(`Fetching ${pair}...`);
    await page.goto(url, { waitUntil: "networkidle2" });

    const rowsData = await page.evaluate(() => {
      const table = document.querySelector('[data-playwright="forward-rates-table"]');
      if (!table) return [];
      const rows = table.querySelectorAll("tbody tr");

      const data = [];
      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        data.push({
          expiration: cells[0]?.innerText.trim(), 
          points: cells[4]?.innerText.trim(),  
        });
      });
      return data;
    });

    results[pair] = rowsData;
  }

  await browser.close();


  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `forward_rates.json`;
  

  const outputPath = path.join(__dirname, filename);
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log("\n✅ Data saved successfully!");
  console.log(`📁 File: ${filename}`);
  console.log(`📍 Path: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  
  Object.entries(results).forEach(([pair, data]) => {
    console.log(`   ${pair.toUpperCase()}: ${data.length} records`);
  });
})();
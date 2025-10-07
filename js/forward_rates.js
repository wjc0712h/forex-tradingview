//FORWARD RATES

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const usd_urls = {
  eurusd: "https://www.investing.com/currencies/eur-usd-forward-rates",
  gbpusd: "https://www.investing.com/currencies/gbp-usd-forward-rates",
  audusd: "https://www.investing.com/currencies/aud-usd-forward-rates",
  nzdusd: "https://www.investing.com/currencies/nzd-usd-forward-rates",
  usdjpy: "https://www.investing.com/currencies/usd-jpy-forward-rates",
  usdchf: "https://www.investing.com/currencies/usd-chf-forward-rates",
  usdcad: "https://www.investing.com/currencies/usd-cad-forward-rates",
};

function parseExpiration(nameCell) {
  const mapping = {
    "ON": "Overnight",
    "TN": "Tomorrow Next",
    "SN": "Spot Next",
    "SW": "One Week",
    "1W": "One Week",
    "2W": "Two Week",
    "3W": "Three Week",
    "1M": "One Month",
    "2M": "Two Month",
    "3M": "Three Month",
    "4M": "Four Month",
    "5M": "Five Month",
    "6M": "Six Month",
    "7M": "Seven Month",
    "8M": "Eight Month",
    "9M": "Nine Month",
    "10M": "Ten Month",
    "11M": "Eleven Month",
    "1Y": "One Year",
    "15M": "Fifteen Month",
    "21M": "Twenty One Month",
    "2Y": "Two Year",
    "3Y": "Three Year",
    "4Y": "Four Year",
    "5Y": "Five Year",
    "6Y": "Six Year",
    "7Y": "Seven Year",
    "8Y": "Eight Year",
    "9Y": "Nine Year",
    "10Y": "Ten Year",
    "15Y": "Fifteen Year",
    "20Y": "Twenty Year",
  };
  
  const match = nameCell.match(/\s([A-Z0-9]+)\s+FWD/i);
  if (match && match[1]) {
    return mapping[match[1].toUpperCase()] || match[1];
  }
  
  return nameCell;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const now = new Date();
  const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const results = {};

  for (const [pair, url] of Object.entries(usd_urls)) {
    console.log(`Fetching ${pair}...`);
    await page.goto(url, { waitUntil: "networkidle2" });

    const rowsData = await page.evaluate(() => {
      const table = document.querySelector('[id="cross_rates_container"]');
      if (!table) return [];
      const rows = table.querySelectorAll("tbody tr");

      const data = [];
      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 5) {
          const nameCell = cells[1]?.innerText.trim() || "";
          const high = cells[4]?.innerText.trim() || "";
          
          data.push({
            expiration: nameCell,
            points: high
          });
        }
      });
      return data;
    });

    const parsedData = rowsData.map(row => ({
      expiration: parseExpiration(row.expiration),
      points: row.points
    }));

    results[pair] = parsedData;
  }

  await browser.close();

  const filename = `data.json`;
  const outputPath = path.join(__dirname, filename);

  let existingData = {};
  if (fs.existsSync(outputPath)) {
    const fileContent = fs.readFileSync(outputPath, 'utf-8');
    existingData = JSON.parse(fileContent);
  }

  existingData[dateKey] = results;

  fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2), 'utf-8');

  console.log("\n Data saved successfully!");
  console.log(`\n File: ${filename}`);
  console.log(`\n Date: ${dateKey}`);
  console.log(`\n Path: ${outputPath}`);
  console.log(`\n Summary:`);
  
  Object.entries(results).forEach(([pair, data]) => {
    console.log(`   ${pair.toUpperCase()}: ${data.length} records`);
  });
})();
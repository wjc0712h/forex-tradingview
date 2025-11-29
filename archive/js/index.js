// JSON TO SIMPLE HTML (Plain Spreadsheet Style)
const fs = require('fs');

const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

const dates = Object.keys(jsonData).sort();
const latestDate = dates[dates.length - 1];
const latestData = jsonData[latestDate];

const recentDates = dates.slice(-10);
const recentData = {};
recentDates.forEach(date => {
  recentData[date] = jsonData[date];
});

function expirationToDays(expiration) {
  const mapping = {
        "Overnight": 1,
        "Tomorrow Next": 2,
        "Spot Next": 3,
        "One Week": 7,
        "Two Week": 14,
        "Three Week": 21,
        "One Month": 30,
        "Two Month": 60,
        "Three Month": 90,
        "Four Month": 120,
        "Five Month": 150,
        "Six Month": 180,
        "Seven Month": 210,
        "Eight Month": 240,
        "Nine Month": 270,
        "Ten Month": 300,
        "Eleven Month": 330,
        "One Year": 365,
        "Two Year": 730,
        "Three Year": 1095,
        "Four Year": 1460,
        "Five Year": 1825,
        "Six Year": 2190,
        "Seven Year": 2555,
        "Ten Year": 3650
        };
  return mapping[expiration] || expiration;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Forward Rates</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-zoom/2.0.1/chartjs-plugin-zoom.min.js"></script>
  <style>
    body {
      margin: 20px;
      font-family: Arial, sans-serif;
    }
    .container {
      display: flex;
      gap: 30px;
      align-items: flex-start;
      margin-bottom: 40px;
    }
    table {
      flex-shrink: 0;
      font-size: 10px;
      width: 200px;
    }
    table th, table td {
      padding: 6px 10px;
      text-align: left;
    }
    table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .chart-wrapper {
      flex: 1;
      min-width: 600px;
      max-width: 900px;
      height: 450px;
      position: relative;
    }
    .date-info {
      background: #f0f0f0;
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    .invert-btn, .reset-btn, .scale-btn {
      padding: 5px 10px;
      font-size: 13px;
      margin: 2px 2px;
      cursor: pointer;
    }

    .chart-controls {
      display: inline-block;
      margin-left: 10px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>Currency Forward Rates</h1>
  <div class="date-info">
    <strong>Latest Data:</strong> ${latestDate}<br>
    <strong>Chart Period:</strong> ${recentDates.join(', ')}<br>
    <strong>Chart Controls:</strong> Scroll to zoom, Drag to pan
  </div>
  ${Object.entries(latestData)
    .map(([pair, rows], index) => {
      const filtered = rows.filter(r => {
        const days = expirationToDays(r.expiration);
        return typeof days === 'number' && days <= 1825;
      });
      
        const colors = [
        'rgba(75, 192, 255, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(132, 99, 255, 1)',
        'rgba(99, 255, 132, 1)',
        'rgba(255, 99, 255, 1)',
        'rgba(231, 233, 237, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(201, 203, 207, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 99, 132, 1)'
        ];
      
      const datasets = recentDates.map((date, i) => {
        const dateData = recentData[date][pair] || [];
        const chartData = dateData
          .filter(r => {
            const days = expirationToDays(r.expiration);
            return typeof days === 'number' && days <= 1825;
          })
          .map(r => ({
            x: expirationToDays(r.expiration),
            y: parseFloat(String(r.points).replace(/,/g, ''))
          }));
        
        return {
          label: date,
          data: chartData,
          borderColor: colors[i],
          backgroundColor: colors[i].replace('1)', '0.1)'),
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: colors[i],
          tension: 0.3
        };
      });
      
      return `
<h2 id="title${index}" style="display: inline-block; margin-right: 15px;">
  ${pair.toUpperCase()}
</h2>
<button class="invert-btn" onclick="invertChart${index}()" style="vertical-align: middle;">
  Invert
</button>
<button class="reset-btn" onclick="resetZoom${index}()" style="vertical-align: middle;">
  Reset Zoom
</button>
<button class="scale-btn" id="scaleBtn${index}" onclick="toggleScale${index}()" style="vertical-align: middle;">
  Scale
</button>
      <div class="container">
        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
            <tr>
              <th>Expiration</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                (r) =>
                  `<tr><td>${expirationToDays(r.expiration)} days</td><td>${r.points}</td></tr>`
              )
              .join('\n')}
          </tbody>
        </table>
        <div class="chart-wrapper">
          <canvas id="chart${index}"></canvas>
        </div>
      </div>
      <script>
       let isInverted${index} = false;
       let isLogScale${index} = false;
       const originalPair${index} = '${pair}';
       
       const chart${index} = new Chart(document.getElementById('chart${index}'), {
            type: 'line',
            data: {
                datasets: ${JSON.stringify(datasets)}
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  },
                  title: {
                    display: true,
                    text: 'Forward Points'
                  },
                  zoom: {
                    pan: {
                      enabled: true,
                      mode: 'x'
                    },
                    zoom: {
                      wheel: {
                        enabled: true
                      },
                      pinch: {
                        enabled: true
                      },
                      mode: 'x'
                    }
                  }
                },
                scales: {
                  x: {
                    type: 'linear',
                    min: 0,
                    max: 2000,
                    title: { 
                      display: true, 
                      text: 'Days (Linear Scale)'
                    },
                    ticks: {
                      callback: function(value) {
                        return Number(value.toFixed(0));
                      }
                    }
                  },
                  y: {
                    title: { display: true, text: 'Points' }
                  }
                }
            }
       });
       
       function invertChart${index}() {
         isInverted${index} = !isInverted${index};
         
         chart${index}.data.datasets.forEach(dataset => {
           dataset.data = dataset.data.map(point => ({
             x: point.x,
             y: -point.y
           }));
         });
         chart${index}.update();
         
         const titleElement = document.getElementById('title${index}');
         if (isInverted${index}) {
           const inverted = originalPair${index}.slice(3) + originalPair${index}.slice(0, 3);
           titleElement.textContent = inverted.toUpperCase();
         } else {
           titleElement.textContent = originalPair${index}.toUpperCase();
         }
       }
       
       function resetZoom${index}() {
         chart${index}.resetZoom();
       }
       
       function toggleScale${index}() {
         isLogScale${index} = !isLogScale${index};
         const btn = document.getElementById('scaleBtn${index}');
         
         if (isLogScale${index}) {
           chart${index}.options.scales.x.type = 'logarithmic';
           chart${index}.options.scales.x.min = 1;
           chart${index}.options.scales.x.max = 2000;
           chart${index}.options.scales.x.title.text = 'Days (Log Scale)';
           btn.textContent = 'Log Scale';
           btn.classList.remove('active');
         } else {
           chart${index}.options.scales.x.type = 'linear';
           chart${index}.options.scales.x.min = 0;
           chart${index}.options.scales.x.max = 2000;
           chart${index}.options.scales.x.title.text = 'Days (Linear Scale)';
           btn.textContent = 'Linear Scale';
           btn.classList.add('active');
         }
         
         chart${index}.update();
       }
      </script>
      `;
    })
    .join('\n')}
</body>
</html>`;

fs.writeFileSync('index.html', html, 'utf-8');
console.log('Plain HTML created: index.html');
console.log(`Latest data: ${latestDate}`);
console.log(`Chart shows: ${recentDates.join(', ')}`);
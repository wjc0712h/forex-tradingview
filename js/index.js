// JSON TO HTML
const fs = require('fs');

const jsonData = JSON.parse(fs.readFileSync('forward_rates.json', 'utf-8'));

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forward Rates Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1600px;
            margin: 0 auto;
        }

        h1 {
            text-align: center;
            color: white;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .pairs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
            gap: 25px;
        }

        .pair-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .pair-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }

        .pair-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 1.5em;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .table-container {
            max-height: 500px;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .table-container::-webkit-scrollbar {
            width: 8px;
        }

        .table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        .table-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: #2c3e50;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: white;
            border-bottom: 2px solid #34495e;
            font-size: 0.9em;
            text-transform: uppercase;
        }

        th:last-child {
            text-align: right;
        }

        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e9ecef;
            color: #212529;
            font-size: 0.95em;
        }

        td:last-child {
            text-align: right;
            font-family: 'Courier New', monospace;
        }

        tbody tr:hover {
            background-color: #f8f9fa;
        }

        .points-positive {
            color: #28a745;
            font-weight: 600;
        }

        .points-negative {
            color: #dc3545;
            font-weight: 600;
        }

        .expiration-cell {
            font-weight: 500;
        }

        .stats {
            padding: 15px;
            background: #f8f9fa;
            border-top: 2px solid #dee2e6;
            display: flex;
            justify-content: space-around;
            font-size: 0.85em;
        }

        .stat-item {
            text-align: center;
        }

        .stat-label {
            color: #6c757d;
            font-size: 0.85em;
            margin-bottom: 5px;
        }

        .stat-value {
            font-weight: bold;
            font-size: 1.1em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Currency Forward Rates Dashboard</h1>
        <div class="pairs-grid" id="pairs-container"></div>
    </div>

    <script>
        const forwardData = ${JSON.stringify(jsonData, null, 2)};

        function calculateStats(data) {
            const points = data.map(d => parseFloat(d.points.replace(/,/g, '')));
            const positive = points.filter(p => p > 0).length;
            const negative = points.filter(p => p < 0).length;
            const oneYearPoint = data.find(d => d.expiration === 'One Year')?.points || 'N/A';
            
            return { positive, negative, oneYearPoint };
        }

        function createPairTable(pair, data) {
            const card = document.createElement('div');
            card.className = 'pair-card';

            const header = document.createElement('div');
            header.className = 'pair-header';
            header.textContent = pair.toUpperCase();

            const tableContainer = document.createElement('div');
            tableContainer.className = 'table-container';

            const table = document.createElement('table');
            table.innerHTML = \`
                <thead>
                    <tr>
                        <th>Expiration</th>
                        <th>Forward Points</th>
                    </tr>
                </thead>
                <tbody>
                    \${data.map(row => {
                        const pointsValue = parseFloat(row.points.replace(/,/g, ''));
                        const pointsClass = pointsValue >= 0 ? 'points-positive' : 'points-negative';
                        return \`
                            <tr>
                                <td class="expiration-cell">\${row.expiration}</td>
                                <td class="\${pointsClass}">\${row.points}</td>
                            </tr>
                        \`;
                    }).join('')}
                </tbody>
            \`;

            const stats = calculateStats(data);
            const statsDiv = document.createElement('div');
            statsDiv.className = 'stats';
            const oneYearClass = parseFloat(stats.oneYearPoint.replace(/,/g, '')) >= 0 ? 'points-positive' : 'points-negative';
            statsDiv.innerHTML = \`
                <div class="stat-item">
                    <div class="stat-label">Total Records</div>
                    <div class="stat-value">\${data.length}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Positive</div>
                    <div class="stat-value points-positive">\${stats.positive}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Negative</div>
                    <div class="stat-value points-negative">\${stats.negative}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">1Y Point</div>
                    <div class="stat-value \${oneYearClass}">\${stats.oneYearPoint}</div>
                </div>
            \`;

            tableContainer.appendChild(table);
            card.appendChild(header);
            card.appendChild(tableContainer);
            card.appendChild(statsDiv);

            return card;
        }

        const container = document.getElementById('pairs-container');
        Object.entries(forwardData).forEach(([pair, data]) => {
            container.appendChild(createPairTable(pair, data));
        });
    </script>
</body>
</html>`;

const outputFilename = 'index.html';
fs.writeFileSync(outputFilename, htmlTemplate, 'utf-8');

console.log('HTML done');
console.log(`file: ${outputFilename}`);
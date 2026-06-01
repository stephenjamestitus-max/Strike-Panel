// scripts/update-csv-photos.js — adds photo paths to Instagram rows in Buffer CSV
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', '.agents', 'strikepane-buffer.csv');
const content = fs.readFileSync(CSV_PATH, 'utf8');

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuote) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch !== '\r') { field += ch; }
    }
  }
  if (row.length > 0 || field !== '') { row.push(field); rows.push(row); }
  return rows;
}

function serializeCSV(rows) {
  return rows.map(row =>
    row.map(f => {
      if (f.includes(',') || f.includes('\n') || f.includes('"')) {
        return '"' + f.replace(/"/g, '""') + '"';
      }
      return f;
    }).join(',')
  ).join('\n') + '\n';
}

const rows = parseCSV(content);
console.log(`Parsed ${rows.length} rows (including header)`);

let igDay = 0;
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (row.length >= 2 && row[1] === '09:00') {
    igDay++;
    // Ensure row has 4 columns
    while (row.length < 4) row.push('');
    row[3] = `marketing/instagram-post-${igDay}.png`;
  }
}

const output = serializeCSV(rows);
fs.writeFileSync(CSV_PATH, output, 'utf8');
console.log(`✅ Updated ${igDay} Instagram rows with photo paths`);

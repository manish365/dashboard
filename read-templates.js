const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const templatesDir = path.join(__dirname, 'public', 'templates');
const files = fs.readdirSync(templatesDir);
let output = '';

files.forEach(file => {
  output += `\n${'='.repeat(60)}\n`;
  output += `FILE: ${file}\n`;
  output += '='.repeat(60) + '\n';
  
  try {
    const workbook = XLSX.readFile(path.join(templatesDir, file));
    workbook.SheetNames.forEach(sheetName => {
      const ws = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      
      output += `\n  Sheet: "${sheetName}"\n`;
      output += `  Total rows: ${data.length}\n`;
      
      // Print first 5 rows
      for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i].map(c => String(c).substring(0, 30));
        output += `  Row ${i}: [${row.join(' | ')}]\n`;
      }
    });
  } catch (err) {
    output += `  ERROR: ${err.message}\n`;
  }
});

fs.writeFileSync(path.join(__dirname, 'template-analysis.txt'), output);
console.log('Done. Output written to template-analysis.txt');

const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const app = express();
const PORT = 5000;

// Upload folder config
const upload = multer({ dest: 'uploads/' });

// Target cells
const targetCells = ['B58','C58','B73','C73','B102','C102','B105','C105','B136','C136','B120','C120'];

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);

  const results = {};
  let currentRow = 0;

  fs.createReadStream(filePath)
    .pipe(iconv.decodeStream('utf16le'))
    .pipe(csv({ separator: '\t', headers: false }))
    .on('data', (row) => {
      currentRow++;

      targetCells.forEach((cell) => {
        const col = cell.charAt(0);
        const rowNum = parseInt(cell.slice(1));

        if (currentRow === rowNum) {
          const colIndex = col === 'B' ? 1 : 2;
          results[cell] = row[colIndex] || '';
        }
      });
    })
    .on('end', () => {
      fs.unlinkSync(filePath);
      res.json({ message: 'Selected cells extracted', data: results });
    })
    .on('error', (err) => {
      res.status(500).json({ message: 'Error parsing CSV', error: err.message });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

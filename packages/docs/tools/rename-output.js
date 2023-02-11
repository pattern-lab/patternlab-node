const fs = require('fs');
const { resolve } = require('path');

const distPath = resolve(__dirname, '..', 'dist');
const outputPath = resolve(__dirname, '..', 'output');

if (fs.existsSync(outputPath)) {
  fs.rmSync(outputPath, { recursive: true, force: true });
}

if (fs.existsSync(distPath)) {
  fs.renameSync(distPath, outputPath);
}

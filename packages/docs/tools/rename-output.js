const fs = require('fs');
const { resolve } = require('path');

const distPath = resolve(process.cwd(), 'dist');
const outputPath = resolve(process.cwd(), 'output');

if (fs.existsSync(outputPath)) {
  fs.rmSync(outputPath, { recursive: true, force: true });
}

if (fs.existsSync(distPath)) {
  fs.renameSync(distPath, outputPath);
}

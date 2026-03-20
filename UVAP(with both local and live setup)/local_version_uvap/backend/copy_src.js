const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const destinations = [
  path.join(__dirname, 'admin-service', 'src'),
  path.join(__dirname, 'faculty-service', 'src'),
  path.join(__dirname, 'student-service', 'src')
];

console.log(`Source Directory: ${srcDir}`);
try {
  const entries = fs.readdirSync(srcDir);
  console.log('Source entries:', entries);
} catch (err) {
  console.error('Error reading source dir:', err);
}

destinations.forEach(dest => {
  try {
    console.log(`Copying src to ${dest}...`);
    fs.cpSync(srcDir, dest, { recursive: true, force: true });
    console.log(`Successfully copied to ${dest}`);
  } catch (err) {
    console.error(`Error copying to ${dest}:`, err);
  }
});

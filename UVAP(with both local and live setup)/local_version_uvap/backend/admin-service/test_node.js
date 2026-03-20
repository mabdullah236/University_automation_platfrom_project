const fs = require('fs');
try {
  fs.writeFileSync('test_node_output.txt', 'Hello World');
  console.log('File written successfully');
} catch (e) {
  console.error('Error writing file:', e);
}

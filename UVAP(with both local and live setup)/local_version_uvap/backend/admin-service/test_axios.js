try {
  require('axios');
  console.log('Axios found and loaded successfully.');
} catch (err) {
  console.error('Failed to load axios:', err.message);
  console.error('Require stack:', err.requireStack);
}

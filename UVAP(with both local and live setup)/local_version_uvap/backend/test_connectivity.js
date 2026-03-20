const axios = require('axios');

async function testConnectivity() {
  console.log('Testing connectivity...');
  
  // 1. Test Root/Health (if exists) or just a known 404 to see if server responds
  try {
    const res = await axios.get('http://localhost:5000/');
    console.log('Root / response:', res.status); // Should be 404 usually if not defined, but means server is UP
  } catch (err) {
    if (err.response) {
      console.log('Root / responded with:', err.response.status); // 404 is GOOD (Server is up)
    } else {
      console.log('Root / failed:', err.message); // Connection refused = Server DOWN
    }
  }

  // 2. Test Planning Endpoint (POST)
  try {
    console.log('Testing POST /api/v1/planning/forecast...');
    const res = await axios.post('http://localhost:5000/api/v1/planning/forecast', {
      maxTeacherLoad: 3,
      sectionSize: 50,
      workingDays: 5
    });
    console.log('Planning Endpoint Success:', res.status);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log('Planning Endpoint Failed with Status:', err.response.status);
      console.log('Error Data:', err.response.data);
    } else {
      console.log('Planning Endpoint Connection Failed:', err.message);
    }
  }
}

testConnectivity();

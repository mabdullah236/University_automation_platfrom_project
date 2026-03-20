const axios = require('axios');

async function testPlanning() {
  try {
    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@uvap.com', // Assuming this admin exists, or I need to find a valid one
      password: 'admin' // Default password? I might need to check seeder or ask user.
    });

    const token = loginRes.data.token;
    console.log('Login successful. Token obtained.');

    // 2. Hit the planning endpoint
    console.log('Testing /api/v1/planning/forecast...');
    const res = await axios.post(
      'http://localhost:5000/api/v1/planning/forecast',
      {
        maxTeacherLoad: 3,
        sectionSize: 50,
        workingDays: 5
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Success!');
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data, null, 2));

  } catch (err) {
    console.error('Error:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testPlanning();

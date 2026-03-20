const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5001/api/v1/courses/allocations/auto-assign';
const LOGIN_URL = 'http://localhost:5001/api/v1/auth/login';

const run = async () => {
  try {
    // 1. Login as Admin
    console.log('Logging in...');
    const loginRes = await axios.post(LOGIN_URL, {
      email: 'admin@uvap.edu.pk', // Assuming default admin
      password: 'admin123' // Assuming default password, might need adjustment if changed
    });
    const token = loginRes.data.token;
    console.log('Logged in. Token:', token.substring(0, 20) + '...');

    // 2. Call Auto-Assign
    console.log('Calling Auto-Assign for batch TEST-2025...');
    const res = await axios.post(API_URL, {
      batch: 'TEST-2025'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Response:', res.data);

    if (res.data.success) {
      console.log('SUCCESS: Auto-assign endpoint works!');
      console.log('Assigned/Updated:', res.data.count);
    } else {
      console.log('FAILED: Endpoint returned success: false');
    }

  } catch (error) {
    console.error('ERROR:', error.response ? error.response.data : error.message);
  }
};

run();

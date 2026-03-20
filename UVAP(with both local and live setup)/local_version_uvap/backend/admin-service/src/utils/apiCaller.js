const NOTIFICATION_SERVICE_URL = 'http://localhost:5004/api/v1/notify';

// @desc    Send Email via Notification Service
exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Caller Error (Email):', error.message);
    // Don't throw error to prevent rollback of main transaction, just log it
    return { success: false, error: error.message };
  }
};

// @desc    Send SMS via Notification Service
exports.sendSMS = async ({ phone, message }) => {
  try {
    const response = await fetch(`${NOTIFICATION_SERVICE_URL}/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Caller Error (SMS):', error.message);
    return { success: false, error: error.message };
  }
};

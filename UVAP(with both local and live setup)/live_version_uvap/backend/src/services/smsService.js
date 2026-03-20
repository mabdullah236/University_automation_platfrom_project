const twilio = require('twilio');

exports.sendSMS = async (to, message) => {
  if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    try {
      const msg = await client.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
      return { success: true, messageId: msg.sid };
    } catch (error) {
      console.error('Twilio Error:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`[MOCK SMS - LIVE] Sending SMS to ${to}: ${message}`);
    return {
      success: true,
      messageId: 'msg_live_mock_' + Date.now(),
    };
  }
};

exports.sendOTP = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  if (process.env.TWILIO_SID) {
    await exports.sendSMS(phone, `Your UVAP OTP is: ${otp}`);
  } else {
    console.log(`[MOCK OTP - LIVE] Generated OTP for ${phone}: ${otp}`);
  }
  return {
    success: true,
    otp,
  };
};

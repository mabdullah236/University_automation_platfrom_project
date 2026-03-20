exports.sendSMS = async (to, message) => {
  console.log(`[MOCK SMS] Sending SMS to ${to}: ${message}`);
  return {
    success: true,
    messageId: 'msg_mock_' + Date.now(),
  };
};

exports.sendOTP = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(`[MOCK OTP] Generated OTP for ${phone}: ${otp}`);
  return {
    success: true,
    otp, // In real app, don't return OTP, just save it
  };
};

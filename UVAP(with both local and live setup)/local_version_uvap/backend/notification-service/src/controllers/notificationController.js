const nodemailer = require('nodemailer');

// @desc    Send Email
// @route   POST /api/v1/notify/email
// @access  Internal (Admin/Faculty Services)
exports.sendEmail = async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ success: false, error: 'Please provide to, subject, and html content' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: 'Email could not be sent' });
  }
};

// @desc    Send SMS
// @route   POST /api/v1/notify/sms
// @access  Internal
exports.sendSMS = async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'Please provide phone and message' });
  }

  // Mock SMS for now unless Twilio credentials are provided
  console.log(`[MOCK SMS] To: ${phone} | Message: ${message}`);
  
  res.status(200).json({ success: true, message: 'SMS sent successfully (Mock)' });
};

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Normalize options
  const to = options.to || options.email;
  const subject = options.subject;
  const htmlContent = options.html || options.message;
  const name = options.name || '';

  // HTML Template
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a73e8; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">UVAP Administration</h1>
      </div>
      <div style="padding: 30px; background-color: #ffffff;">
        <h2 style="color: #333;">Hello ${name},</h2>
        <div style="color: #555; line-height: 1.6;">
          ${htmlContent}
        </div>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #888; font-size: 12px;">
        <p>This is an automated system email. Please do not reply directly to this email.</p>
        <p>&copy; ${new Date().getFullYear()} University Automation System</p>
      </div>
    </div>
  `;

  // Define email options
  const mailOptions = {
    from: `"UVAP Administration" <${process.env.SMTP_EMAIL}>`,
    to: to,
    subject: subject,
    html: htmlTemplate,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

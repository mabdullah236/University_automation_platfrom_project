require('dotenv').config();
const sendEmail = require('./src/utils/emailService');

const testEmail = async () => {
  console.log('Testing sendEmail with "to" and "html"...');
  try {
    await sendEmail({
      to: process.env.SMTP_EMAIL, // Send to self
      subject: 'Test Email Fix - Option 1',
      html: '<p>This is a test using "to" and "html".</p>',
      name: 'Tester'
    });
    console.log('Success: Option 1');
  } catch (error) {
    console.error('Failed: Option 1', error);
  }

  console.log('Testing sendEmail with "email" and "message"...');
  try {
    await sendEmail({
      email: process.env.SMTP_EMAIL, // Send to self
      subject: 'Test Email Fix - Option 2',
      message: '<p>This is a test using "email" and "message".</p>',
      name: 'Tester'
    });
    console.log('Success: Option 2');
  } catch (error) {
    console.error('Failed: Option 2', error);
  }
};

testEmail();

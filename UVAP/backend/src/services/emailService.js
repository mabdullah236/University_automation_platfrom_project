
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendPortalActivationEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: `UniPortal <${process.env.EMAIL_FROM}>`,
        to: userEmail,
        subject: 'Your University Portal Access Activated',
        html: `
            <h1>Welcome to UniPortal!</h1>
            <p>Hello ${userName},</p>
            <p>We are pleased to inform you that your student portal is now active.</p>
            <p>You can log in using your registered email address and password.</p>
            <p>If you have any issues, please contact the administration.</p>
            <br>
            <p>Thank you,</p>
            <p>University Administration</p>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Portal activation email sent to:', userEmail);
        // Log or view the email preview URL if using Ethereal
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = {
    sendPortalActivationEmail,
};

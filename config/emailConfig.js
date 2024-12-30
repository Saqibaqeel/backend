
// // Import necessary packages
// require('dotenv').config(); // Load environment variables from .env file
// const nodemailer = require('nodemailer');

// // Check if required environment variables are defined
// if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//   console.error('Please make sure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS are set in the .env file');
//   process.exit(1); // Exit the application if any required env variable is missing
// }

// // Create the transporter object for nodemailer
// let transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,          // SMTP host (e.g., smtp.gmail.com)
//   port: process.env.EMAIL_PORT,          // SMTP port (e.g., 587 for Gmail)
//   secure: process.env.EMAIL_PORT == 465, // If port 465, use SSL (secure connection)
//   auth: {
//     user: process.env.EMAIL_USER,        // Your email address
//     pass: process.env.EMAIL_PASS,        // Your email password
//   },
// });

// // Export the transporter for use in other parts of your app
// module.exports = transporter;


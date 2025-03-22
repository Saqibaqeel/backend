const express=require('express');
const bodyParser = require('body-parser');
const ProgressBar = require('progress');
const cors = require('cors');

const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const app=express();

require('dotenv').config();

const PORT = process.env.Port || 5000;
const URL='mongodb://127.0.0.1:27017/userdb';
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }))


app.use(cors());

app.use(bodyParser.json()); 
// app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use('/users', userRoutes);
app.use('/files', fileRoutes);





// app.get('/upload', (req, res) => {
//     const html = `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Upload PDF</title>
//       </head>
//       <body>
//           <h1>Upload Your PDF File</h1>
//           <form action="/files/upload" method="POST" enctype="multipart/form-data">
//               <label for="pdf">Choose a PDF file to upload:</label>
//               <input type="file" name="pdf" accept=".pdf" required>
//               <button type="submit">Upload PDF</button>
//           </form>
//       </body>
//       </html>
//     `;
//     res.send(html);
//   });



const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");





 
  

const start = async () => {
    await mongoose.connect(URL);
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};


start();

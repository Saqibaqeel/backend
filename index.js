const express=require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const fileRoutes = require('./routes/fileRoutes');
const app=express();

require('dotenv').config();

const PORT = process.env.Port || 5000;
const URL='mongodb://127.0.0.1:27017/userdb';


app.use(cors());

app.use(bodyParser.json()); 
// app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/users', userRoutes);
app.use('/files', fileRoutes);



const start = async () => {
    await mongoose.connect(URL);
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};


start();

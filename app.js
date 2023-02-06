const mysql = require('mysql'); 
const express = require('express'); 
const session = require('express-session'); 
const path = require('path');
const bodyParser = require('body-parser'); 
const router = require('./routes/index'); 
const multer = require('multer'); 
const dbconnection = require('./dbconnection'); 
const flash = require('connect-flash'); 
const bcrypt = require('bcryptjs'); 
const { Verify } = require('crypto'); 
const nodemailer = require('nodemailer'); 
const cron = require('node-cron'); 
const webpush = require('web-push');
const easyinvoice = require('easyinvoice');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
require('dotenv').config();  


var Recaptcha = require('express-recaptcha').RecaptchaV3


const app = express(); 
app.use(bodyParser.urlencoded({
    extended: false
})); 
app.use(bodyParser.json()); 



app.use(session({
    secret: 'ABCdefg', 
    resave: true,
    rolling: true, 
    saveUninitialized: false, 
    cookie: {
        expires: 100000000000000
    }
  })); 
  app.use(flash()); 


//serve static files 
app.use(express.static('public')); 
app.use('/images', express.static(__dirname + '/images')); 
app.use('/videos', express.static(__dirname + '/videos')); 
app.use('/leases', express.static(__dirname + '/leases')); 



//set view engine 
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');  

//node mail 


//reference to router
app.use('/', router); 



//start server 
app.listen(9000, function(){
    console.log("Server running on port 9000....");
}); 

module.exports = app;
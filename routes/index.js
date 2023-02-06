

const mysql = require('mysql'); 
const express = require('express');
const router = express.Router(); 
const bodyParser = require('body-parser'); 
const session = require('express-session'); 
const flash = require('connect-flash'); 
const dbconnection = require('../dbconnection'); 
const multer = require('multer'); 
const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const app = require('../app'); 
const { start } = require('repl'); 
const bcrypt = require('bcryptjs'); 
const webpush = require('web-push');
const { Verify, randomUUID } = require('crypto');
const { isFunction, isNumber } = require('util'); 
const nodemailer = require('nodemailer');
const easyinvoice = require('easyinvoice');
const { doesNotMatch } = require('assert');
const { name } = require('ejs'); 
const cron = require('node-cron'); 
const uniqid = require('uniqid');
const randtoken = require('rand-token');
const request = require('request');
const jwt = require('jsonwebtoken');
const { response } = require('../app');
const emailValidator = require('deep-email-validator');
const fetch = require("isomorphic-fetch");
const accountSid = 'ACbb376edc6d49e56a9971bf61d3dc7303'; 
const authToken = '4c7fe949887a5c7d9b4efa6cd4e20a2e'; 
const client = require('twilio')(accountSid, authToken); 
require('dotenv').config();  




sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//render home page 

router.get('/', function(req, res){ 
    let email;

     // Instantiate the SMTP server 
     dbconnection.query('SELECT email FROM tenants', async(error, result)=>{ 
        if(error) throw error;
       result.forEach(item=>{ 
        email = item;
       })
        
        //sending emails at periodic intervals
        cron.schedule(" 0 0 25 * *", function(){ 
            const msg = {
                to: process.env.GMAIL_USER, // Change to your recipient
                from: `${req.body.email}`, // Change to your verified sender
                subject: 'ALERT!!',
                text: 'Reminder!! Make sure to pay your monthly rentals',
            }
            try {
                sgMail.send(msg);
                res.send("Message Successfully Sent!");
              } catch (error) {
                res.send("Message Could not be Sent")
        
              }
        });

    dbconnection.query("SELECT * FROM vacancies ORDER BY vacId LIMIT 4", async(error, result)=>{ 
        if(error) throw error; 
        const header = result; 
        const images = []; 
        let imageName; 
        let image; 
        let imageNames; 
        let pictures;
      for(const item of result) {
        pictures = item.images; 
        imageNames = JSON.parse(pictures);

            imageNames.forEach((item) => { 
                imageName = item; 

                for( let i =imageNames.length; i <= 1; i++){ 
                    image = 'images/' + imageName; 
                    images.push({image, imageName});
                }

                

            });  
        }

        dbconnection.query("SELECT * FROM vacancies WHERE tenant is null ORDER BY vacId DESC LIMIT 3", async(error, result)=>{ 
            if(error) throw error; 
           const featured = result; 

           const images = []; 
           let imageName; 
           let image; 
           let imageNames; 
           let pictures;
         for(const item of result) {
           pictures = item.images; 
           imageNames = JSON.parse(pictures);

               imageNames.forEach((item) => { 
                   imageName = item; 

                   for( let i =imageNames.length; i <= 1; i++){ 
                       image = 'images/' + imageName; 
                       images.push({image, imageName});
                   }

                   

               });  
           }

        dbconnection.query("SELECT * FROM users LIMIT 3", async(error, result)=>{
            if(error) throw error; 
          const landlord = result; 


        

           res.render('index', {title: 'Home',featured, landlord, header, images}); 

        });

        });
    }); 
   })
});  


router.post('/preference', (req, res)=>{ 
    const {location,rooms,price,area,amenities,bathrooms,bedrooms,contactName,contactNumber} = req.body; 

    dbconnection.query('INSERT INTO enquiries SET ?', {location:location,price:price,amenities:amenities,bathrooms:bathrooms,bedrooms:bedrooms,rooms:rooms,area:area,contactName:contactName,contactNumber:contactNumber,status:'Pending'}, async(err, result)=>{ 
        if(err) throw err; 
        res.redirect('/');
    })
});

router.get('/contactus', (req, res)=>{
    res.render('contactus', {
        title: 'Contact Us'
    });
});
//contact form 
router.post('/contact',(req, res) => {  
    // Instantiate the SMTP server
    const smtpTrans = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
        user: process.env.GMAIL_USER, // Sender email username
        pass: process.env.GMAIL_PASSWORD, // Sender email password, not the normal one.
        }
      })
    
      // Specify what the email will look like
      const mailOpts = {
        from: `${req.body.email}`, //Sender mail
        to: process.env.GMAIL_REALESTATE,					// Recever mail
        subject: `${req.body.subject}`,
        html: `
       <p> Email: ${req.body.email} </p><br>
       <p> Name: ${req.body.name} </p><br>
       <p> Message: ${req.body.message}</p> 
        `
      }; 

    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
    {
      return res.json({"responseError" : "something went wrong"});
    }
    const secretKey = "6LeMpPAjAAAAAPmkDsiNK3oTeoNxGwObtHVzifO9";
   
    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
   
    request(verificationURL,function(error,response,body) {
      body = JSON.parse(body);
   
      if(body.success !== undefined && !body.success) {
        return res.json({"responseError" : "Failed captcha verification"});
      }
  // Send mail with defined transport object
  smtpTrans.sendMail(mailOpts, (error, info) => {
    if (error) {
            res.send('<h4 style="color:red" > Something Wrong. </h4>');
    }
    res.send('<h4 style="color: green" >Thank You, Message has been Sent.');
});  
    });
 


  

});	




   

//search route 
//render notfound
router.get('/notfound', function(req, res){ 
    res.render('notfound');
});  

  
router.post('/search', (req, res)=>{ 
    const { propertytype,bathrooms,bedrooms, location, price} = req.body;

    dbconnection.query("SELECT * FROM vacancies WHERE tenant is null AND price <= ? AND bathrooms <= ? AND location = ? AND propertytype = ? AND bedrooms <= ?",[price,bathrooms,propertytype,bedrooms,location], async(error, result)=>{
        if(error) throw error; 
        const resultsperPage = 9; 

        const vacancies = await result; 
        let notfound = []; 
        notfound = result;
        if(notfound.length == 0){ 
            res.render('notfound');

        } else {  

        const numOfVacancies = result.length; 
        const numOfPages = Math.ceil(numOfVacancies / resultsperPage); 
        let page = req.query.page ? Number(req.query.page) : 1; 
        if(page > numOfPages){
            res.redirect('/searchresult?page='+encodeURIComponent(numOfPages)); 
    
        }else if(page<1){  
            res.redirect('/searchresult?page='+encodeURIComponent('1'));
        }
        //determine sql limit start number 
        const startingLimit = (page -1) * resultsperPage; 
        sql = `SELECT * FROM vacancies LIMIT ${startingLimit},${resultsperPage}`; 
        dbconnection.query(sql, (err, result)=>{ 
            if(err) throw err; 
            let iterator = (page - 2) < 1 ? 1 : page - 1; 
            let endingLink = (iterator + 3) <= numOfPages ? (iterator + 9) : page + (numOfPages - page); 
        
            properties = result; 
        res.render('searchresult', {vacancies,  message: 'Search Results',
            data: result, page, iterator, endingLink, numOfPages});
        });
    }
 
    });
}); 



//render search result 
router.get('/searchresult', (req, res)=> { 
    res.render('searchresult');
});


//render signup 

router.get('/signup', function(req, res){ 
    res.render('signup');
}); 

//render login
router.get('/login', function(req, res){ 
    res.render('login');
});  

router.get('/applications', (req, res)=>{  
    dbconnection.query('SELECT * FROM enquiries',(err, result)=>{
        if(err) throw err; 

        res.render('applications', {
            profilemessage: '' + req.session.agentFullName  + '',
            profilepicture: '' +req.session.profileimage+ '',
            title: 'House Enquiries',
            message: req.flash('message'),
            enquiries:result
        }
        
        );

    })
})



//render add house 
router.get('/addammenities', function(req, res){ 
    res.render('addammenities');
});     

//render add house 
router.get('/addhousedetails', function(req, res){ 
    res.render('addhousedetails');
});  
 


//render applications




//AGENT DASHBOARD PROPERTIES
//add and retrieve agent properties 


//add house details
router.get('/addhouse', (req, res)=> { 
    res.render('addhousedetails');
}); 

router.post('/savehouse', (req,res)=> { 
    const agent = req.session.username;

    const {address,location,area,rooms,bedrooms,bathrooms,amenities,description,price, insurance,propertytype} = req.body; 
    dbconnection.query('INSERT INTO vacancies SET ?', {address:address,location:location,area:area,rooms:rooms,bedrooms:bedrooms,bathrooms:bathrooms,amenities:amenities,price:price,insurance:insurance, description:description,agent:agent,propertytype:propertytype}, async(err, results)=>{
        if(err) throw err; 
        req.flash('message','Property Added Successfully');
        res.redirect('/myproperties');
    }) 
});



        //edit vacancies
router.get('/alter/:vacId', function(req, res, next){ 

    var vacId =req.params.vacId; 

    var query = `SELECT * FROM vacancies WHERE vacId = "${vacId}"`; 

    dbconnection.query(query, function(error, result){ 
        res.render('editmyproperty', {title: 'Edit Property Details',   profilemessage: '' +  req.session.agentFullName  + '', 
        profilepicture: '' +req.session.profileimage+ '', agentprop: result[0]});
    });
}); 




router.get('/addvideo/:vacId', function(req, res, next){ 

    var vacId =req.params.vacId; 

    var query = `SELECT * FROM vacancies WHERE vacId = "${vacId}"`; 

    dbconnection.query(query, function(error, result){ 
        res.render('multimediaupload', {agentprop: result[0]});
    });
}); 
   //update properties to database
   router.post('/updatehouse', (req, res) => { 
    const {vacId} = req.body;
    let sql = "UPDATE vacancies SET address='" + req.body.address +"', location='" +req.body.location +"', tenant='" +req.body.tenant +"', area='"+req.body.area +"', rooms = '" + req.body.rooms +"', bedrooms='"+req.body.bedrooms+"',bathrooms='"+req.body.bathrooms+"',amenities='"+req.body.amenities+"', price='"+req.body.price+"', vacdescription='"+req.body.description+"' WHERE vacId="+vacId;
    dbconnection.query( sql,(err,results)=>{
        if(err) throw err; 
        req.flash('message','Property Updated Successfully');
        res.redirect('/myproperties');
    });
}); 



//delete myproperty 
router.get('/remove/:vacId', function(req, res, next){ 

    var vacId = req.params.vacId; 

    var query = `DELETE FROM vacancies WHERE vacId = "${vacId}"`; 

    dbconnection.query(query, function(error, result){ 
        if(error) throw error; 
        req.flash('message','Property Deleted Successfully');
        res.redirect('/myproperties');
    });
});  

router.get('/editrecord/:paymentId', function(req, res, next){ 

    var paymentId =req.params.paymentId; 

    var query = `SELECT * FROM additionalpayments WHERE paymentId = "${paymentId}"`; 

    dbconnection.query(query, function(error, result){ 
        res.render('editaddpayments', {
            title: 'Edit Payment Details', 
            addpayment: result[0], houseaddresses
        });
    });
}); 

router.get('/editrental/:id', function(req, res, next){ 

    var id =req.params.id; 

    var query = `SELECT * FROM paymentrecord WHERE id = "${id}"`; 

    dbconnection.query(query, function(error, result){ 
        res.render('editpaymentstatus', {
            title: 'Edit Payment Details', 
            payrecord: result[0], tenants,tenaddress
        });
    });
}); 

router.post('/updateaddpayments', (req, res) => { 
    const {paymentId} = req.body;
    let sql = "UPDATE additionalpayments SET address='" + req.body.address +"', payment='" +req.body.payment +"', paymentstatus='" +req.body.paymentstatus +"', month='"+req.body.month +"', year = '" + req.body.year +"',  notes='"+req.body.notes+"' WHERE paymentId="+paymentId;
    dbconnection.query( sql,(err,results)=>{
        if(err) throw err; 
        req.flash('message','Record Updated Successfully');
        res.redirect('/additionalpayments');
    });
}); 

router.post('/updatepaymentstatus', (req, res) => { 
    const {id} = req.body;
    let sql = "UPDATE paymentrecord SET address='" + req.body.address +"', fullname='" +req.body.fullname +"', date='"+req.body.date+"', paymentstatus='" +req.body.paymentstatus +"', month='"+req.body.month +"', year = '" + req.body.year +"', amountpaid = '"+req.body.amountpaid +"',note='"+req.body.notes+"' WHERE id="+id;
    dbconnection.query( sql,(err,results)=>{
        if(err) throw err; 
        req.flash('message','Record Updated Successfully');
        res.redirect('/addpaymentstatus');
    });
}); 

router.get('/deleterecord/:paymentId', function(req, res, next){ 

    var paymentId = req.params.paymentId; 

    var query = `DELETE FROM additionalpayments WHERE paymentId = "${paymentId}"`; 

    dbconnection.query(query, function(error, result){ 
        if(error) throw error; 
        req.flash('message','Record Deleted');
        res.redirect('/additionalpayments');
    });
}); 

router.get('/deleterental/:id', (req, res)=>{ 
    var id = req.params.id; 
    dbconnection.query(`DELETE FROM paymentrecord WHERE id = ${id}`, async(error, result)=>{ 
        if(error) throw error; 
        req.flash('message','Record Deleted');
        res.redirect('/addpaymentstatus')
    })
})

router.get('/addmainpicture', function(req, res, next){ 

    var vacId =req.params.vacId; 

    var query = `SELECT * FROM vacancies WHERE vacId = "${vacId}"`; 

    dbconnection.query(query, function(error, result){ 
        res.render('addmainpicture', {property: result[0]});
    });
});

     
//ENDD VACANCIES
//END AGENT PROPERTIES 


//get tenants 
let tenants = []; 
router.get('/tenants', (req, res, next) => {  
    const agent = req.session.username;
    dbconnection.query('SELECT * FROM tenants t JOIN vacancies v ON t.username = v.tenant WHERE v.username =?',[agent], async(error, result) =>{ 
        if(error) throw error; 
        tenants = result; 
        res.render('tenants', { 
            profilemessage: '' +  req.session.agentFullName  + '', 
            profilepicture: '' +req.session.profileimage+ '',
            title: 'Tenants List',

            tenants});
    });
}); 

let tenantproperty = [];
router.get('/tenantproperty', (req, res)=>{ 
    const tenant = req.session.username; 
    const tenname = req.session.tenantfullname;
    dbconnection.query('SELECT * FROM vacancies WHERE tenant =?',[tenant], (err, rows)=>{ 
        if(err) throw err;  
        tenantproperty  = rows;
        res.render('tenantproperty', { 
            profilemessage: '' + req.session.tenantfullname + '',
            message: req.flash('message'),
            title: 'Residence Occupied',

            tenantproperty 
        }); 
    }); 
}); 

//FILE UPLOADS 

//image upload  

//proofof payments 
let houseaddresses;
router.get('/additionalpayments', (req, res)=>{ 

    dbconnection.query('SELECT * FROM tenants t JOIN vacancies v ON t.username = v.tenant WHERE t.username =?',[req.session.username], async(err, results)=>{
        if(err) throw err;  
        let houseaddress = []; 
        houseaddresses = [];
        results.forEach(item=>{ 
            houseaddress = item.address; 
            houseaddresses.push(houseaddress);

        }) 

    dbconnection.query('SELECT * FROM additionalpayments WHERE username = ?',[req.session.username], (error, result)=>{ 
        if(error) throw error; 
        let addpayments = []; 
        addpayments = result; 
        res.render('additionalpayments', { 
            profilemessage: '' + req.session.tenantfullname + '', addpayments, houseaddresses, 
            title: 'Services Payment Record',
            message: req.flash('message')


        });

    });
});

});

var proofstorage = multer.diskStorage({
    destination: './proof',
    filename: function(req, file, callback) { 
        callback(null,req.session.username + file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});  

const proofupload = multer({ 
    storage: proofstorage
}); 

router.post('/additionalpayments', proofupload.single('paymentproof'), function (req, res, next) {
    var {address,payment,paymentstatus,notes,month, year} = req.body;
 
    dbconnection.query('INSERT INTO additionalpayments SET ?',{address:address,paymentproof:req.file.filename,payment:payment,notes:notes,month:month,year:year,paymentstatus:paymentstatus,username:req.session.username},async(err, results)=>{
         if(err) throw err; 
         res.redirect('/additionalpayments');
     });
  }); 

  //send renovation request 
  var quotationstorage = multer.diskStorage({
    destination: './proof',
    filename: function(req, file, callback) { 
        callback(null,req.session.username + file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});  

const quotationupload = multer({ 
    storage: quotationstorage
});  

router.post('/requestreno/:vacId', quotationupload.single('quotation'),(req, res)=>{ 
    const vacId = req.params.vacId;
    const {address, renovation} = req.body; 
    const quotation = req.file.filename;
    dbconnection.query(`SELECT * FROM vacancies WHERE vacId = ${vacId}`, async(error, result)=> {
        if(error) throw error; 
        var agent = result[0].username; 
        dbconnection.query('INSERT INTO renovationrequests SET ?', {status:'Pending',renovationaddress:address,renovation:renovation,tenant:req.session.username,agent:agent,quotation:quotation}, async(err, results)=>{ 
            if(err) throw err;
            req.flash('message','Request Sent');
            res.redirect('/tenantproperty');
        })
    })
})
//Property images upload
var imgstorage = multer.diskStorage({
    destination: './images',
    filename: function(req, file, callback) {   
        let imgid;
        for(let i=1; i<=count;i++){ 
            imgid = i;
        }
        
        if (file.fieldname === "coverimage") {
            callback(null, req.session.username + file.fieldname + '_'+ Date.now()+ path.extname(file.originalname));
        } else if(file.fieldname === "images"){
        callback(null, req.session.username + file.fieldname + imgid + '_'+ Date.now() + path.extname(file.originalname)); 
        }
    }
});  

const imgupload = multer({ 
    storage: imgstorage, 
    fileFilter: function(req, file, callback){ 
        checkFileType(file, callback);
       //check file type
  function checkFileType(file, callback){ 
    const filetype = /jpg|jpeg|png/;

    //check extension 
    const extname = filetype.test(path.extname(file.originalname).toLowerCase()); 

    //check mime type 
    const mimetype = filetype.test(file.mimetype); 

    if(mimetype && extname){ 
        return callback(null, true)
    } else{ 
        callback('Error: Images only');
    }
}
    } 
   
}); 

let count;

let propimgupload = imgupload.fields([{ name: 'images', maxCount: 8 }, { name: 'coverimage', maxCount: 1 }]);
router.post('/imgupload', propimgupload, (req, res, next)=>{   



  const agent = req.session.username; 
  const {address,location,area,rooms,bedrooms,bathrooms,amenities,description,price,insurance,propertytype} = req.body; 

   let file = []; 
   var pictures; 
  let pic;
  pic = 'images/'+ req.files['coverimage'][0].filename; 
  let name;

  req.files['images'].forEach(element=>{
      nameofimage = element.filename; 
       name = nameofimage; 
       file.push(`${name}`);
      })
  count = req.files['images'].length;

 
   pictures = JSON.stringify(file); 
      dbconnection.query('INSERT INTO vacancies SET ?', {address:address,location:location,area:area,rooms:rooms,bedrooms:bedrooms,bathrooms:bathrooms,amenities:amenities,price:price,vacdescription:description,username:agent,images: pictures, coverimage: pic,propertytype:propertytype,insurance:insurance}, async(err, results)=>{
          if(err) throw err;  
          req.flash('message','Property Added Successfully');
          res.redirect('/myproperties');

      });
}); 

//user profileimage
var profileimgstorage = multer.diskStorage({
    destination: './images',
    filename: function(req, file, callback) { 
       
        callback(null, req.session.username + file.fieldname + '_'+ path.extname(file.originalname));
    }
}); 

 
const profileimgupload = multer({ 
    storage: profileimgstorage, 
    fileFilter: function(req, file, callback){ 
        checkFileType(file, callback);
       //check file type
  function checkFileType(file, callback){ 
    const filetype = /jpg|jpeg|png/;

    //check extension 
    const extname = filetype.test(path.extname(file.originalname).toLowerCase()); 

    //check mime type 
    const mimetype = filetype.test(file.mimetype); 

    if(mimetype && extname){ 
        return callback(null, true)
    } else{ 
        callback('Error: Images only');
    }
}
    } 
   
});  


router.post('/profileimgupload', profileimgupload.single('profileimage'), function (req, res, next) {
    let pic;
    if(!req.file){ 
        pic = 'images/defaultprofileimage.jpg'
    } else{ 
        pic = 'images/'+ req.file.filename; 

    }
    const {userId} = req.body; 
    let sql = "UPDATE users SET description='" + req.body.description +"', twitter='" +req.body.twitter +"',profileimage='" + pic +"' ,facebook='"+req.body.facebook +"', instagram = '" + req.body.instagram +"' WHERE username=? AND userId="+userId;
    dbconnection.query(sql,[req.session.username],async(err, results)=>{
         if(err) throw err; 
         res.redirect('/dashboard');
     })
  }) 

//video upload
var vidstorage = multer.diskStorage({
    destination: './videos',
    filename: function(req, file, callback) { 
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});  

const vidupload = multer({ 
    storage: vidstorage, 
    fileFilter: function(req, file, cb){
        checkFileType(file, cb); 

        //check file type
function checkFileType(file, cb){ 
    const filetypes = /ogg|mp4|avi|mov|mpeg-4/;

    //check extension 
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); 

    //check mime type 
    const mimetype = filetypes.test(file.mimetype); 

    if(mimetype && extname){ 
        return cb(null,true)
    } else{ 
        cb('Error: Videos only');
    }
}
    }
}).single('video');  



router.post('/vidupload', (req, res, next)=>{ 

    vidupload(req, res, (err) => { 

        if(err){ 
            res.render('addhousedetails', { 
                msg: err
            }); 
            
        } else{ 
            const {vacId} = req.body;

                dbconnection.query("UPDATE vacancies SET video='" + req.file.filename +"' WHERE vacId="+vacId, async(error, result)=>{
                    if(error) throw error; 
                    req.flash('message','Video Uploaded Successfully');

                    res.redirect('/myproperties');
                });
            
        }
    });
}); 

//leases uploads 
 router.get('/addlease', function(req, res){ 
    res.render('addleasedetails');
 }); 

var leasestorage = multer.diskStorage({
    destination: './leases',
    filename: function(req, file, callback) { 
        callback(null,req.session.username + file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});  

const updateleasedetails = multer({ 
    storage: leasestorage, 
    fileFilter: function(req, file, cb){
        checkFileType(file, cb); 

        //check file type
function checkFileType(file, cb){ 
    const filetypes = /pdf|docx|doc/;

    //check extension 
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); 

    //check mime type 
    const mimetype = filetypes.test(file.mimetype); 

    if(mimetype && extname){ 
        return cb(null,true)
    } else{ 
        cb('Error: Document files only');
    }
}
    }
}).single('leasefile');  

const leaseupload = multer({ 
    storage: leasestorage, 
    fileFilter: function(req, file, cb){
        checkFileType(file, cb); 

        //check file type
function checkFileType(file, cb){ 
    const filetypes = /pdf|docx|doc/;

    //check extension 
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); 

    //check mime type 
    const mimetype = filetypes.test(file.mimetype); 

    if(mimetype && extname){ 
        return cb(null,true)
    } else{ 
        cb('Error: Document files only');
    }
}
    }
}).single('leasefile');  


let leaseaddress = []; 

router.post('/leaseupload', (req, res, next)=>{ 

    leaseupload(req, res, (err) => { 

        if(err){ 
            res.render('addleasedetails', { 
                msg: err
            }); 
            
        } else{ 
            const {address,owner,expirydate} = req.body; 
            const username = req.session.username; 
            
            dbconnection.query('SELECT * FROM vacancies WHERE username = ?',[username], async(error, result)=>{  
                if(error) throw error;

                dbconnection.query('INSERT INTO leases SET ?', {owner:owner,address:address,leasefile:req.file.filename,expirydate:expirydate, username:username} , async(error, result)=>{
                    if(error) throw error; 
                    let leases = []; 
                    leases = result;
                    req.flash('message','Lease File Uploaded Successfully');
                    res.redirect('/lease');
                });
            });
        }
    });
}); 

router.get('/renovationrequests', (req, res)=>{
    var agent = req.session.username; 
    dbconnection.query('SELECT address FROM vacancies v INNER JOIN renovationrequests r ON v.tenant = r.tenant WHERE v.username = ?', [agent], async(error, result)=>{ 
        if(error) throw error;
        let renovationaddress = result[0].address; 
        
        dbconnection.query('SELECT * FROM renovationrequests WHERE renovationaddress = ?',[renovationaddress], async(err, results)=>{ 
            if(err) throw err; 
            let requests = []; 
            requests = results; 

            res.render('renovationrequests', { 
                profilemessage: '' + req.session.agentFullName  + '',
                profilepicture: '' +req.session.profileimage+ '',
                title: 'Renovation Requests',
                message: req.flash('message'),
                requests
            }); 
        })


    })
})  

router.get('/renovationrequested', (req, res)=>{ 
    dbconnection.query('SELECT * FROM renovationrequests WHERE tenant = ?', [req.session.username], async(error, result)=>{
        if(error) throw error; 
        let requested = []; 
        requested = result; 

        res.render('renovationrequested', { 
            profilemessage: '' + req.session.tenantfullname  + '',
            title: 'Renovations Requested',
            requested
        }); 
        })
}) 

router.get('/grant/:renoreqId', (req, res)=>{ 
    var renoreqId = req.params.renoreqId; 
    dbconnection.query(`UPDATE renovationrequests SET status = 'granted' WHERE renoreqId = ${renoreqId}`, (error, result)=>{
        if(error) throw error; 

        req.flash('message','Request Granted');
        res.redirect('/renovationrequests'); 

    })
}) 

router.get('/deny/:renoreqId', (req, res)=>{ 
    var renoreqId = req.params.renoreqId; 
    dbconnection.query(`SELECT * FROM renovationrequests WHERE renoreqId = ${renoreqId}`, (error, result)=>{
        if(error) throw error; 

        res.render('denyrequestreason', {title: 'Denying Request',   profilemessage: '' +  req.session.agentFullName  + '', 
        profilepicture: '' +req.session.profileimage+ '', request: result[0]}); 

    })
}) 

router.post('/denyingrequest', (req, res)=>{ 
    var renoreqId = req.body.renoreqId; 
    dbconnection.query("UPDATE renovationrequests SET  status = 'Denied', reason ='" + req.body.reason +"' WHERE renoreqId ="+renoreqId, (error, result)=>{
        if(error) throw error; 

        req.flash('message','Request Denied');
        res.redirect('/renovationrequests'); 

    })
})

router.get('/viewquotation/:renoreqId', function(req, res){ 
    var renoreqId = req.params.renoreqId;
    dbconnection.query(`SELECT * FROM renovationrequests WHERE renoreqId = ${renoreqId}`,(error, result)=>{ 
        if (error) throw error; 
        const path = `./proof/${result[0].quotation}`;

        if (fs.existsSync(path)) {
            res.contentType("image/jpg");
            fs.createReadStream(path).pipe(res)
        } else {
            res.status(500)
            console.log('File not found')
            res.send('File not found')
        }

    })
   
  }); 

  router.get('/viewproofofpayment/:paymentId', function(req, res){ 
    var paymentId = req.params.paymentId;
    dbconnection.query(`SELECT * FROM additionalpayments WHERE paymentId = ${paymentId}`,(error, result)=>{ 
        if (error) throw error; 
        const path = `./proof/${result[0].paymentproof}`;

        if (fs.existsSync(path)) {
            res.contentType("image/jpg");
            fs.createReadStream(path).pipe(res)
        } else {
            res.status(500)
            console.log('File not found')
            res.send('File not found')
        }

    })
   
  }); 

router.get('/lease', (req, res, next)=>{  
    const agent = req.session.username; 

       dbconnection.query('SELECT address FROM vacancies WHERE username = ?',[agent], async(error, result)=>{  
                if(error) throw error; 
                let addresses =[]; 

                
                if(leaseaddress == 0){
                    result.forEach(item=>{
                     addresses = item.address; 
                        leaseaddress.push(addresses);

                }) 
            } 


      dbconnection.query('SELECT * FROM leases WHERE username =?',[agent], (err, rows)=>{ 
        if(err) throw err;   
        let leases = [];
       leases = rows;
        res.render('lease', { 
            profilemessage: '' + req.session.agentFullName  + '',
            profilepicture: '' +req.session.profileimage+ '', 
            title: 'Leases',
            message: req.flash('message'),
            leases, leaseaddress
        }); 
    });
            
    }); 

});  

router.get('/editing/:leaseId', function(req, res, next){ 



    var leaseId =req.params.leaseId; 

    var query = `SELECT * FROM leases WHERE leaseId = "${leaseId}"`; 

    dbconnection.query(query, function(error, result){ 
        res.render('editlease', {title: 'Edit Lease Details', lease: result[0]});
    }); 
}); 

router.post('/updateleasedetails', (req, res) => { 
    updateleasedetails(req, res, (err) => { 
        if(err) throw err;

    const {leaseId} = req.body;
    let sql = "UPDATE leases SET address='" + req.body.address +"', owner='"+ req.body.owner+"', expirydate='" +req.body.expirydate +"', leasefile='"+req.file.filename+"' WHERE leaseId="+leaseId;
    dbconnection.query( sql,(err,results)=>{
        if(err) throw err; 
        req.flash('message','Lease Details Updated Successfully');
        res.redirect('/lease');
    });
});

}); 

router.get('/deletion/:leaseId', function(req, res, next){ 

    var leaseId = req.params.leaseId; 

    var query = `DELETE FROM leases WHERE leaseId = "${leaseId}"`; 

    dbconnection.query(query, function(error, result){ 
        if(error) throw error; 
        req.flash('message','Lease File Deleted Successfully');
        res.redirect('/lease');
    });
});
  


router.get('/tenantlease', (req, res, next)=>{  
    const tenant = req.session.username;
    dbconnection.query('SELECT * FROM vacancies WHERE tenant =?',[tenant], async(error,result)=>{
        if(error) throw error;
        let leaseaddress = result[0].address;

    dbconnection.query('SELECT * FROM leases WHERE address =?',[leaseaddress], (err, rows)=>{ 
        if(err) throw err;   
        let leases = [];
       leases = rows;
        res.render('tenantlease', { 
            profilemessage: '' + req.session.tenantfullname  + '',
            title: 'Residence Lease',
            leases
        }); 
    }); 
});

}); 

router.get('/viewlease/:leaseId', function(req, res){ 
    var leaseid = req.params.leaseId;
    dbconnection.query(`SELECT * FROM leases WHERE leaseId = ${leaseid}`,(error, result)=>{ 
        if (error) throw error; 
        const path = `./leases/${result[0].leasefile}`;

        if (fs.existsSync(path)) {
            res.contentType("application/pdf");
            fs.createReadStream(path).pipe(res)
        } else {
            res.status(500)
            console.log('File not found')
            res.send('File not found')
        }

    })
   
  }); 

  router.get('/viewproof/:paymentId', function(req, res){ 
    var paymentId = req.params.paymentId;
    dbconnection.query(`SELECT * FROM additionalpayments WHERE paymentId = ${paymentId}`,(error, result)=>{ 
        if (error) throw error; 
        const path = `./proof/${result[0].paymentproof}`;

        if (fs.existsSync(path)) {
            res.contentType("image/jpg");
            fs.createReadStream(path).pipe(res)
        } else {
            res.status(500)
            console.log('File not found')
            res.send('File not found')
        }

    })
   
  }); 

//ADD AGENT PROPERTIES

 let myproperties = [];
router.get('/myproperties', (req, res, next)=>{  
    const agent = req.session.username; 
  
    dbconnection.query('SELECT * FROM vacancies WHERE username =?',[agent], (err, rows)=>{ 
        if(err) throw err;  
        myproperties = rows;
        res.render('myproperties', { 
            profilemessage: '' + req.session.agentFullName  + '',
            profilepicture: '' +req.session.profileimage+ '',
            title: 'All Properties',
            message: req.flash('message'),
            myproperties
        }); 
    }); 

}); 




//REGISTRATION AND LOGIN ROUTES
//handle form post requests for register user 

router.post('/register',(req,res,next)=>{
    const {fullname,username,phone,email,password,cpassword} = req.body; 
    const role = req.body.role; 
    let pic = 'images/defaultprofileimage.jpg';

    


     dbconnection.query('SELECT *  FROM users WHERE username=? OR email=?',[username,email], async (error,results)=>{
            if(error) throw error; 

        
             
            if(results.length == 1){
                return res.render('signup',{
                    Message:'Credentials already registered'
                });
            } else if(results.length == 0){ 
                dbconnection.query('SELECT * FROM tenants WHERE username=? OR email=?',[username,email], async(error,results)=>{
                    if(error) throw error;  

                    if(results.length == 1){ 
                        return res.render('signup',{
                            Message:'Credentials already registered'
                        });
                    } else if(role=="Agent" || role=="Property Manager" || role=="Home Owner"){
                        if(password !== cpassword){
                             res.render('signup',{
                                Message: 'Passwords do not match'
                            }); 
                        } 
                    
                        let hashedPassword = await bcrypt.hash(password,10); 
            
                        dbconnection.query('INSERT INTO users SET ?',{agentFullName:fullname,username:username,phone:phone,email:email,role:role,password:hashedPassword,profileimage:pic},(error,results)=>{
                            if(error) throw error;
                            res.render('login',{
                                   Msg:'successfully registered!'
                                }); 
                     });
                        
                    } else { 
                        if(password !== cpassword){
                            res.render('signup',{
                               Message: 'Passwords do not match'
                           }); 
                       } else{

                       }
                    
                       let hashedPassword = await bcrypt.hash(password,10); 
           
                       dbconnection.query('INSERT INTO tenants SET ?',{fullname:fullname,username:username,phone:phone,email:email,password:hashedPassword},(error,results)=>{
                           if(error) throw error;
                           res.render('login',{
                                  Msg:'successfully registered!'
                               }); 
                    });
                        
                    }
                });
            }
    })
});

let agentFullName; 
let tenantfullname;
//handle post request for user login 
router.post('/login', (req,res,next)=>{
    const {username,password} = req.body; 

    
     dbconnection.query('SELECT profileimage,agentFullName,username,password FROM users WHERE username = ? ', [username], async (error,results)=>{
            if(error) throw error; 
            if(results.length ==1){   
                agentFullName = results[0].agentFullName; 
                let profilepicture = results[0].profileimage;

                let verify = bcrypt.compareSync(password,results[0].password); 

                if(verify){
                
                req.session.loggedin = true;
                req.session.username = username; 
                req.session.agentFullName = agentFullName; 
                req.session.profileimage = profilepicture; 
                res.redirect('/dashboard');  

                 } else{
                    return res.render('login',{
                        Message:'Wrong username/password'
                    });
            }
            
             
            } else { 
                dbconnection.query('SELECT fullname,username, password FROM tenants WHERE username=?', [username], async(error, results)=>{
                    if(error) throw error; 
                    

                    if(results.length==1){
                        tenantfullname = results[0].fullname;

                        let verify = bcrypt.compareSync(password,results[0].password); 

                        if(verify){ 
                            req.session.loggedin = true;
                            req.session.username = username; 
                            req.session.tenantfullname = tenantfullname;

                            res.redirect('/tenantdash');
                        } else { 
                            return res.render('login',{
                                Message:'Wrong username/password'
                            });
                        }
                    }
                });
             }
        });
    }); 

   //render dashboard 
   router.get('/dashboard', (req, res)=> {  
    const agent = req.session.username;
    if(req.session.loggedin){ 
        dbconnection.query('SELECT COUNT(*) AS tenant FROM tenants t JOIN vacancies v ON t.username = v.tenant WHERE v.username =?', [agent],(error, result, fields)=> { 
            if(error) throw error; 
           let tenant = result[0].tenant;
       
        dbconnection.query('SELECT COUNT(*) AS houses FROM vacancies WHERE username =?', [agent], (error, result, fields)=> { 
            if(error) throw error; 
            let houses = result[0].houses;
    
        res.render('dashboard', { 
            profilemessage: '' + req.session.agentFullName + '', 
            profilepicture: '' +req.session.profileimage+ '',
            title: 'Dashboard',
            tenant, houses
        }); 
    });
    }); 
        
} else {
    res.redirect('/login')
}
});   


   //render tenant dashboard 
   router.get('/tenantdash', (req, res)=> {  
    if(req.session.loggedin){ 
        dbconnection.query('SELECT COUNT(*) AS residence FROM vacancies WHERE tenant = ?', [req.session.username], async(err, result)=>{ 
          let  residence = result[0].residence;
        res.render('tenantdash', {
            profilemessage: '' + req.session.tenantfullname + '',  notices, residence 

        });
    })

    } else { 
        res.redirect('/login');
    }
});

router.get('/logout', (req, res)=> { 
    req.session.destroy(); 
    res.render('login');;
}); 



//TENANT RENOVATIONS
//render tenants renovations
router.get('/tenantrenovations', function(req, res){  
    const agent = req.session.username;
    dbconnection.query("SELECT * from renovations r LEFT JOIN vacancies v ON r.agent = v.username LEFT JOIN tenants t ON r.tenant = t.username WHERE r.agent= ?",[agent] ,(err, rows) =>{ 
        if(err) throw err;  
        let renovations = []; 
        renovations = rows;
        res.render('tenantrenovations', { 
            profilemessage: '' + req.session.agentFullName  + '',
            profilepicture: '' +req.session.profileimage+ '',
            title: 'Tenant Renovations',

            renovations
        });
    });
});  

router.get('/renovations', function(req, res){ 
    const tenant = req.session.username
    dbconnection.query("SELECT * from renovations WHERE tenant=?",[tenant], (err, rows) =>{ 
        if(err) throw err; 
        res.render('renovations', { 
            profilemessage: '' + req.session.tenantfullname + '',
            title: 'Renovations Made',
            message: req.flash('message'),

            renovations: rows
        });
    });
}); 

//add  tenant renovations 
router.get('/addRenovation', (req, res) => {  
    res.render('addtenantrenovations');                     
});  


//save renovations to database
router.post('/savereno/:vacId', (req, res) => { 
    const tenant = req.session.username; 
    const vacId = req.params.vacId;
    const {renovation,date,cost,address} = req.body; 
    dbconnection.query(`SELECT * FROM vacancies WHERE vacId = ${vacId}`, async(error, result)=>{
        if(error) throw error; 
        let agentName = result[0].username;

    dbconnection.query('INSERT INTO renovations SET ?',{renovation:renovation,date:date,cost:cost,agent:agentName,tenant:tenant,address:address}, async(err,results)=>{
        if(err) throw err; 
        req.flash('message','Renovation Edited Successfully');
        res.redirect('/renovations');
    });
}); 
    });



//edit renovations 
router.get('/edit/:renovationId', function(req, res, next){ 

    var renovationId =req.params.renovationId; 

    var query = `SELECT * FROM renovations WHERE renovationId = "${renovationId}"`; 

    dbconnection.query(query, function(error, result){ 
        res.render('editrenovation', {title: 'Edit Renovations', renovation: result[0]});
    });
}); 

//update renovations to database
router.post('/update', (req, res) => { 
    const {renovationId} = req.body;
    let sql = "UPDATE renovations SET renovation='" + req.body.renovation +"', date='" +req.body.date+"', cost='"+req.body.cost+"' WHERE renovationId ="+renovationId;
    dbconnection.query( sql,(err,results)=>{
        if(err) throw err; 
        req.flash('message','Renovation Updated Successfully');
        res.redirect('/renovations');
    });
}); 

//delete renovation
router.get('/delete/:renovationId', function(req, res, next){ 

    var renovationId =req.params.renovationId; 

    var query = `DELETE FROM renovations WHERE renovationId = "${renovationId}"`; 

    dbconnection.query(query, function(error, result){ 
        if(error) throw error; 
        req.flash('message','Renovation Edited Successfully');
        res.redirect('/renovations');
    });
});  

router.get('/bvisa/:id', function(req, res, next){ 

    var id =req.params.id; 

    var query = `DELETE FROM enquiries WHERE id = "${id}"`; 

    dbconnection.query(query, function(error, result){ 
        if(error) throw error; 
        res.redirect('/applications');
    });
}); 

router.get('/ipa/:id', function(req, res, next){ 

    var id =req.params.id; 
    dbconnection.query(`UPDATE enquiries SET status = 'Complete' WHERE id = ${id}`, (error, result)=>{
        if(error) throw error; 

        req.flash('message','Status Updated');
        res.redirect('/applications'); 

    })
}) 

router.get('/viewtenantreno', (req, res)=>{ 
    const agent = req.session.username;
    dbconnection.query('SELECT * FROM vacancies v JOIN tenants t ON t.username = v.tenant WHERE v.username =?',[agent], async(error, result) =>{ 
        if(error) throw error; 
        tenantreno = result; 
        res.render('viewtenantreno', { 
            profilemessage: '' + req.session.agentFullName  + '',
            profilepicture: '' +req.session.profileimage+ '',

            tenantreno});
    });
});

//END OF TENANT RENOVATIONS


    
   //PROPERTIES
  //ALL PROPERTIES 

 let properties = []; 
 let images = [];
router.get('/properties', (req, res, next) => { 
    const resultsperPage = 9; 

    dbconnection.query('SELECT * FROM vacancies ', async(error, result) =>{ 
    if(error) throw error;         
    const numOfVacancies = result.length; 
    const numOfPages = Math.ceil(numOfVacancies / resultsperPage); 
    let page = req.query.page ? Number(req.query.page) : 1 ; 
    if(page > numOfPages){
        res.redirect('/properties?page='+encodeURIComponent(numOfPages)); 

    } else if(page < 0){ 
        res.redirect('/properties?page='+encodeURIComponent('1'));
    }
    //determine sql limit start number 
    const startingLimit = ((page - 1 ) * resultsperPage); 
    sql = `SELECT * FROM vacancies WHERE tenant is null LIMIT ${startingLimit},${resultsperPage} `; 

    dbconnection.query(sql, (err, result)=>{ 
        if(err) throw err; 
        let iterator = (page - 2) < 1 ? 1 : page - 1; 
        let endingLink = (iterator + 3) <= numOfPages ? (iterator + 9) : page + (numOfPages - page); 

        let rented;
        if(result.tenant == 1){
            rented = "images/ribbon-rented.png"
        }

        properties = result;  
        if(result && result.length){ 
            const images = []; 
            let imageName; 
            let image; 
            let imageNames = []; 
            let pictures; 
            
            result.forEach((item)=>{ 

                pictures = item.images; 
                imageNames = JSON.parse(pictures); 
                
                
                imageNames.forEach((item)=>{
                    imageName = imageNames[0]; 
                  
                    image = 'images/' + imageName; 

                })
                images.push({image, imageName});

        });




            res.render('properties', {properties, 
                data: result, page, iterator, endingLink, numOfPages, images,rented});

        } else {
            res.render('properties', {properties, 
                data: result, page, iterator, endingLink, numOfPages,rented,
                 images: [] 
                });

        }
     });  
    }); 
    
}); 

//render single properties  
var singleproperties =[]; 

router.get('/singleproperty/:vacId', (req, res)=>{ 
    const vacId = req.params.vacId; 
    const agent = req.session.username; 

    dbconnection.query("SELECT * FROM vacancies INNER JOIN users ON vacancies.username = users.username WHERE vacId = ?",[vacId],function(err, result){ 
        if(err) throw err; 
        singleproperties = result; 

        let videos; 
            let vidName; 

            const video = [];
            for (const vid of result) {
               vidName = vid.video;
               videos = 'videos/' + vidName;
              video.push({ videos, vidName }); 
            } 
        
        if(result && result.length){ 
            const images = []; 
            let imageName; 
            let image; 
            let imageNames; 
            let pictures; 
            

            for(const item of result) {
                pictures = item.images; 
                imageNames = JSON.parse(pictures);

                    imageNames.forEach((item) => { 
                        imageName = item; 

                        for( let i =imageNames.length; i <= imageNames.length; i++){ 
                            image = 'images/' + imageName; 
                            images.push({image, imageName});
                        }

                        
   
                    });  
               


            } 
            res.render('singleproperty', {singleproperties, images, video});
 
        } else {
            res.render('singleproperty', {singleproperties,
                 images: [], video
                });

        }
    });
});
//display property images 

//view agent properties 



let agentvac = [];
router.get('/agentvacancies/:username',(req, res)=>{ 
    const username = req.params.username;
    dbconnection.query(`SELECT * FROM vacancies WHERE username = ?`,[username], async(error, result)=>{ 
        if(error) throw error; 
        agentvac = result;
        const resultsperPage = 9; 


        const numOfVacancies = result.length; 
        const numOfPages = Math.ceil(numOfVacancies / resultsperPage); 
        let page = req.query.page ? Number(req.query.page) : 1; 
        if(page > numOfPages){
            res.redirect('/agentvacancies?page='+encodeURIComponent(numOfPages)); 
    
        }else if(page<1){ 
            res.redirect('/agentvacancies?page='+encodeURIComponent('1'));
        }
        //determine sql limit start number 
        const startingLimit = (page -1) * resultsperPage; 
        sql = `SELECT * FROM vacancies tenant is null LIMIT ${startingLimit},${resultsperPage}`; 
        dbconnection.query(sql, (err, result)=>{ 
            if(err) throw err; 
            let iterator = (page - 2) < 1 ? 1 : page - 1; 
            let endingLink = (iterator + 3) <= numOfPages ? (iterator + 9) : page + (numOfPages - page); 
        
        res.render('agentvacancies', {agentvac, 
            data: result, page, iterator, endingLink, numOfPages});
        });

    })
})
  

//render add house 
router.get('/multimediaupload', function(req, res){ 
    res.render('multimediaupload', { 
        profilemessage: '' + req.session.username + ''
    });
});  

//AGENTS 
//render setting profile 
router.get('/profile', function(req, res){ 
   
    res.render('profile', { 
        profilemessage: '' + req.session.agentFullName  + '',
        profilepicture: '' +req.session.profileimage+ ''

    });
});  

router.get('/agentprofile', (req, res)=>{ 

    var username = req.session.username; 
    if(username){ 
        dbconnection.query("SELECT * FROM users WHERE username = ?", [username], async(error, result)=>{ 
            if(error) throw error; 
            const profiles = result; 

            res.render('agentprofile', {
                profilemessage: '' + req.session.agentFullName  + '',
                profilepicture: '' +req.session.profileimage+ '',

                profiles
            } );

        })
    } else{ 
        res.redirect('/login');
    }
});
 
router.get('/change/:userId', (req, res)=>{  

    var userId = req.params.userId;
    if(req.session.username){
    dbconnection.query(`SELECT * FROM users WHERE userId= "${userId}"`,[req.session.username], async(error, result)=>{
        if(error) throw error;    

            res.render('profile', {
                profilemessage: ''+req.session.agentFullName +'',
                profilepicture: '' +req.session.profileimage+ '',

                 profile: result[0]});
    
    });
    } else{ 
        return res.redirect('/login');
    }
});

//save profile
router.post('/saveprofile', (req,res)=> { 
   const {userId} = req.body; 
   let sql = "UPDATE users SET description='" + req.body.description +"', twitter='" +req.body.twitter +"', facebook='"+req.body.facebook +"', instagram = '" + req.body.instagram +"' WHERE username=? AND userId="+userId;
   dbconnection.query(sql,[req.session.username],async(err, results)=>{
        if(err) throw err; 
        res.redirect('/dashboard');
    })
}) 




//render agents
let agents = []; 
router.get('/agents', (req, res, next) => { 
    const resultsperPage = 5; 

   dbconnection.query('SELECT * FROM users', async(error, result) =>{ 
   if(error) throw error; 
   const numOfAgents = result.length; 
   const numOfPages = Math.ceil(numOfAgents / resultsperPage); 
   let page = req.query.page ? Number(req.query.page) : 1; 
   if(page > numOfPages){
       res.redirect('/agents?page='+encodeURIComponent(numOfPages)); 

   }else if(page<1){
       res.redirect('/agents?page='+encodeURIComponent('1'));
   }
   //determine sql limit start number 
   const startingLimit = (page -1) * resultsperPage; 
   sql = `SELECT * FROM users LIMIT ${startingLimit},${resultsperPage}`; 
   dbconnection.query(sql, (err, result)=>{ 
       if(err) throw err; 
       let iterator = (page - 2) < 1 ? 1 : page - 1; 
       let endingLink = (iterator + 3) <= numOfPages ? (iterator + 9) : page + (numOfPages - page); 
   
       agents = result; 
   res.render('agents', {agents, title: 'Agents',
       data: result, page, iterator, endingLink, numOfPages});
   });
   
      });
    });   

router.get('/sendenquiry', (req, res)=>{ 
    dbconnection.query('SELECT phone FROM users', (error, result)=>{ 
        if(error) throw error; 
        res.render('/', {enquiry: result});
    })
})







//RESETTING PASSWORD 



router.get('/newpassword', (req, res)=>{ 
    res.render('newpassword');
})

router.get('/resetpassword', function(res, res){ 
    res.render('resetpassword');
}) 


router.post('/resetpassword', function(req, res, next) {

    //send email
function sendingEmail(email, token) {
 
    var email = email;
    var token = token;
 
    var mailer = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Your email id
            pass: process.env.GMAIL_PASSWORD // Your password
        }
    });
 
    var mailOptions = {
        from: 'tutsmake@gmail.com',
        to: email,
        subject: 'Reset Password Link - Real Estate Website',
        html: '<p>You requested for reset password, kindly use this <a href="http://localhost:9000/newpassword?token=' + token + '">link</a> to reset your password</p>'
 
    };
 
    mailer.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(1)
        } else {
            console.log(0)
        }
    });
}
    var email = req.body.email;
    //console.log(sendEmail(email, fullUrl));
 dbconnection.query('SELECT * FROM users WHERE email =?',[email], function(err, result) {
      if (err) throw err; 
       if (result[0].email.length ==1 ) {
         var token = randtoken.generate(20);
         var sent = sendingEmail(email, token);
             if (sent != '0') {
                  var data = {
                  token: token
             }
         dbconnection.query('UPDATE users SET ? WHERE email ="' + email + '"', [data], function(err, result) {
             if(err) throw err
            })
          res.render('resetpassword', { 
              msgsuccess: 'The reset password link has been sent to your email address'
             }) 
             }    else {
             res.render('resetpassword', { 
                msgerror: 'The Email is not registered with us'

        })   
    }
    } else { 
        var token = randtoken.generate(20);
         var sent = sendingEmail(email, token);
             if (sent != '0') {
                  var data = {
                  token: token
             }
         dbconnection.query('UPDATE tenants SET ? WHERE email ="' + email + '"', [data], function(err, result) {
             if(err) throw err
            })
          res.render('resetpassword', { 
              msgsuccess: 'The reset password link has been sent to your email address'
             }) 
             }    else {
             res.render('resetpassword', { 
                msgerror: 'The Email is not registered with us'

        })   
    }
   
    } 
    });
})
    


/* send reset password link in email */ 
/*
router.post('/resetpassword1', function(req, res, next) { 

    //send email
function sendEmail(email, token) {
 
    var email = email;
    var token = token;
 
    var mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD
        }
    });
 
    var mailOptions = {
        from: 'skinmantaku@gmail.com',
        to: req.body.email,
        subject: 'Reset Password Link - skinmantaku.com',
        html: '<p>You requested for reset password, kindly use this <a href="http://localhost:9000/reset-password?token=' + token + '">link</a> to reset your password</p>'
 
    };
 
    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            res.render('resetpassword', { 
                msgerror: 'Link not sent'
            })        
         } else {
res.render('resetpassword', { 
    msgsuccess: 'Link successfully sent to email'
})       
 }
    });
}

const {email} = req.body;  

dbconnection.query('SELECT email FROM users WHERE email = ?', [email], async(error, result)=>{ 
    var {email} = req.body;  

    if(error) throw error;
          
    if (result.length > 0) {

       var token = randtoken.generate(20);

       var sent = sendEmail(email, token);

         if (sent != '0') {

            var data = {
                token: token
            }

            dbconnection.query('UPDATE users SET ? WHERE email ="' + email + '"', data, function(err, result) {
                if(err) throw err
     
            })

            res.render('resetpassword', { 
                msgsuccess: 'Link successfully sent to email'
            }) 

        } else {
            res.render('resetpassword', { 
                msgerror: 'Something goes to wrong. Please try again'
            })           
        }

    } else {
        res.render('resetpassword', { 
            msgerror: 'The Email is not registered with us'
        })         

    }
    res.redirect('/login');
})

 
}) 
*/
/* update password to database */
router.post('/updatepassword', function(req, res) {
 
    var {username,password} = req.body;
   dbconnection.query('SELECT username,password,token FROM users WHERE username = ?',[username], async(err, result)=>{
        if (err) throw err; 
        

     
        if (result.length == 1) {
                
            let newpasswordhash = await bcrypt.hash(password,10);
 
             // var hash = bcrypt.hash(password, saltRounds);
                    dbconnection.query('UPDATE users SET password ="'+newpasswordhash+'" WHERE username =?',[username], function(err, result) {
                        if(err) throw err 

                        res.render('login', { 
                            Message: 'Your password has been changed successfully'
                        })
                   
                    });
 
             
          } else {
   
              dbconnection.query('UPDATE tenants SET password = "'+newpasswordhash+'" WHERE username = ?', [username], async(error, results)=>{ 
                if(error) throw error; 

                res.render('login', { 
                    msgsuccess: 'Your password has been changed successfully'
                })
           

              })
   
              }
      });
})


//NOTICES 
router.get('/addnotice', (req, res)=>{ 
    res.render('addnoticedetails')
}); 

router.post('/addnotices', (req, res)=>{ 

    client.messages 
      .create({ 
         body: `${req.body.notice}`,  
         messagingServiceSid: 'MGdf935479fe5e2de038657a96674bf4b6',      
         to: `${req.body.recipient}` 
       }) 
      .then(message => 
        res.redirect('/agentnotices')) 
      .done();

}) 

let tenant = [];
router.get('/agentnotices', (req, res)=>{ 
    let tenantname = [];
    
    dbconnection.query('SELECT * FROM tenants t JOIN vacancies v ON t.username = v.tenant WHERE v.username =?',[req.session.username], async(error, result) =>{ 
        if(error) throw error; 
        if(tenant == 0){
            result.forEach(item=>{ 
                tenantname = item.fullname; 
                tenant.push(tenantname);
            }) 
        }
 console.log(tenant);

    dbconnection.query('SELECT * FROM notices WHERE agent = ?', [req.session.username], async(error, result)=>{
        if (error) throw error; 
        let notices = []; 
        notices = result; 
        res.render('agentnotices', { 
            profilemessage: '' + req.session.agentFullName  + '',
            profilepicture: '' +req.session.profileimage+ '',
            title: 'Notices',

            notices,tenant
        })
     }) 
    }); 
})

router.get('/tenantnotices', (req, res)=>{ 
    dbconnection.query('SELECT * FROM notices WHERE recipient = ?', [req.session.username], async(error, result)=>{
        if (error) throw error; 
        let notices = []; 
        notices = result; 
        res.render('tenantnotices', { 
            profilemessage: '' + req.session.tenantfullname  + '',
            notices
        })
     })
}) 

//paystatus 
router.get('/paystatus', (req, res, next) => {  
    const agent = req.session.username;
    dbconnection.query('SELECT * FROM tenants t JOIN vacancies v ON t.username = v.tenant WHERE v.username =?',[agent], async(error, result) =>{ 
        if(error) throw error; 
        tenants = result; 
        res.render('tenants', { 
            profilemessage: '' + req.session.agentFullName  + '',
            profilepicture: '' +req.session.profileimage+ '',

            tenants});
    });
}); 




let payrecords = []; 
let tenaddress;
router.get('/addpaymentstatus', (req, res)=>{ 
    var agent = req.session.username; 
    dbconnection.query('SELECT * FROM tenants t JOIN vacancies v ON t.username = v.tenant WHERE v.username =?',[agent], async(error, result) =>{ 
        if(error) throw error; 
        let tenant = []; 
        tenaddress = []; 
        let resaddress = [];
        if(tenants == 0){ 
            result.forEach(item=>{ 
                tenant = item.fullname; 
                
                tenants.push(tenant);
            }) 
        } 
        result.forEach(item=>{ 
            resaddress = item.address;
            tenaddress.push(resaddress);
        }) 
       let payments = result[0].price;
        dbconnection.query("SELECT * FROM paymentrecord WHERE agent = ?",[agent], function(error, data){
        if(error) throw error; 
        payrecords = data;
        res.render('addpaymentstatus', { 
            profilemessage: '' + req.session.agentFullName + '', 
            profilepicture: '' +req.session.profileimage+ '',
            title: 'Tenant Payment Record', 
            message: req.flash('message'),
            payrecords, tenants, tenaddress, payments
        })
    }); 
}); 

}); 

router.get('/addpaymentrecord/:edit', (request, response)=>{ 
    var id = request.body.id;

        let sql = "UPDATE users SET fullname='" + request.body.fullname +"', address='" +request.body.address +"',paymentstatus='" + request.body.paymentstatus +"' ,date='"+request.body.date +"', month= '" + request.body.month+"',year='"+request.body.year +"', note='"+request.body.note+"' WHERE username=? AND id="+id;


		dbconnection.query(sql, function(error, data){ 
            if(error) throw error;
			response.render('addpaymentrecord',{
				message : 'Data Edited'
			});
		});

}) 

router.get('/deleterecord/:id', (request, response)=>{ 
    
    var id = request.params.id;

    var query = `DELETE FROM paymentrecord WHERE id = "${id}"`;

    dbconnection.query(query, function(error, data){
        if(error) throw error;
        response.redirect('/addpaymentstatus');

    });
})



router.post('/addpaymentstatus', (req, res)=>{ 
    var {fullname,address,paymentstatus,date,month,year,note,amountpaid} = req.body; 
    var agent = req.session.username; 
    var date = Date();
    dbconnection.query('SELECT * FROM tenants t JOIN vacancies v ON t.username = v.tenant WHERE v.username =?',[agent], async(err, result)=>{ 
        if(err) throw err;
        let details = []; 
        details = result;
    dbconnection.query('INSERT INTO paymentrecord SET ?',{fullname:fullname,address:address,paymentstatus:paymentstatus,date:date,month:month,year:year,note:note,agent:agent,amountpaid:amountpaid},async(error, result)=>{
        if(error) throw error; 
        res.redirect('/addpaymentstatus');
    });
}); 
});

router.get('/viewpaymentstatus', (req, res)=>{ 
    dbconnection.query('SELECT * FROM paymentrecord p INNER JOIN tenants t ON t.fullname = p.fullname WHERE t.username =?',[req.session.username], async(error, result) =>{ 
     
        if(error) throw error; 
        let tenpayrecords = []; 
        tenpayrecords = result;
        res.render('viewpaymentstatus', { 
            profilemessage: '' + req.session.tenantfullname  + '', 
            profilepicture: '' +req.session.profileimage+ '',
            title: 'Rent Payment Record',
            tenpayrecords
        })
}); 

}); 

router.get('/viewadditionalpayment', (req, res)=>{ 
    dbconnection.query('SELECT * FROM vacancies v INNER JOIN additionalpayments p ON v.address = p.address WHERE v.username = ? ', [req.session.username], async(error, result)=>{ 
        if(error) throw error; 
        let addpayments = []; 
        addpayments = result; 
        res.render('viewadditionalpayment', { 
            profilemessage: '' + req.session.agentFullName  + '', addpayments,
            profilepicture: '' +req.session.profileimage+ '',
            title: 'Tenant Services Payment Record'

        });
    })
})

router.get('/paymentrecord', async(req, res)=>{ 
    var agent = req.session.username;

    dbconnection.query('SELECT * FROM paymentrecord WHERE agent = ?', [agent], async(error, result)=>{ 
        if(error) throw error; 
        let payrecord = []; 
        payrecord = result; 
        res.render('paymentrecord', { 
            profilemessage: '' + req.session.agentFullName  + '', payrecord, 
                        profilepicture: '' +req.session.profileimage+ ''


        })
    })
}) 

let notices = []; 

router.get('/mynotices', (req, res)=>{ 
    dbconnection.query('SELECT * FROM notices n LEFT JOIN tenants t ON n.recipient = t.fullname LEFT JOIN users u ON n.agent = u.username WHERE t.username = ?',[req.session.username], (error, results)=>{ 
        if(error) throw error; 
        notices = results; 
        res.render('mynotices', { 
            profilemessage: '' + req.session.tenantfullname  + '', notices, 
            title: 'Notices'


        })
    })
})



let tenantsvacancies = [];
router.get('/generatestatement', (req, res)=>{
    dbconnection.query('SELECT * FROM users WHERE username = ?', [req.session.username], async(err, result)=>{
        if(err) throw err; 
        let agentdetails = []; 
        agentdetails = result; 

        dbconnection.query('SELECT * FROM tenants t JOIN vacancies v ON t.username = v.tenant WHERE v.username =?', [req.session.username], async(error, results)=>{
            if(error) throw error; 
            let tenant = []; 
            let hometenants = [];
            let resaddress = [];
            let rent = [];
                results.forEach(item=>{ 
                    tenant = item.fullname; 
                    
                    hometenants.push(tenant);
                }) 

            tenantsvacancies = results; 

          res.render('generatestatement', { 
            title: 'Statement Of Accounts', 
            agentdetails, tenantsvacancies, hometenants,
            profilemessage: '' + req.session.agentFullName  + '',
            message: req.flash('message'),
            profilepicture: '' +req.session.profileimage+ ''
          });
          

        })       
    })
})


router.post('/statementofaccounts', (req, res)=>{ 
    const {tenantname,month,year} = req.body; 
    let repairsdone = []; 
    let repairnames = [];
    let rentalprice = [];
    var invoicenumber = Date.now();
    var date = Date();

    dbconnection.query('SELECT * FROM users WHERE username = ?', [req.session.username], async(error, result)=>{
        if(error) throw error; 
        let agentdetails = []; 
        agentdetails = result; 
        
       dbconnection.query('SELECT * FROM tenants t JOIN vacancies INNER JOIN vacancies v ON t.username = v.tenant WHERE v.username = ?', [req.session.username], async(err, data)=>{ 
        if(err) throw err; 
        let tenantdetails = []; 
        tenantdetails = data;

        dbconnection.query('SELECT * FROM paymentrecord p LEFT JOIN tenants t ON p.fullname  = t.fullname LEFT JOIN vacancies v ON p.address = v.address LEFT JOIN renovations r ON p.address = r.address WHERE t.fullname = ? AND p.month = ? AND p.year = ?',[tenantname,month, year], async(err, results)=>{ 
            if(err) throw err; 
            let invoicedetails = []; 
            invoicedetails = results; 

            dbconnection.query('SELECT * FROM paymentrecord p JOIN renovations r ON r.agent = p.agent WHERE p.fullname = ? AND p.month = ? AND p.year = ?', [tenantname,month, year], async(error, rows)=>{
                if(error) throw error; 
                let paymentdetails = []; 
                paymentdetails = rows; 
                let rental = []; 
                let repairs = []; 
                let repairname = [];
                
          
                rows.forEach(item=>{
                    rental = item.amountpaid;
                    repairs = item.cost; 
                    repairname = item.renovation; 
                    rentalprice.push(rental);
                    repairsdone.push(repairs);
                    repairnames.push(repairname);
                    
                    console.log(rentalprice) 
                    console.log(repairsdone) 
                    console.log(repairnames)
                    
                }) 
                console.log(rows.length);

                for(let i = 0; i <= rows.length; i++){

                    var data = {

                        // Let's add a recipient
                        "client": {
                            "company": `${tenantdetails[0].fullname}`,
                            "address": `${tenantdetails[0].phone}`,
                            "country": `${tenantdetails[0].email}`,
                            "zip": `${tenantdetails[0].address}`,
                            "city": `${tenantdetails[0].location}`
                        },
                    
                        // Now let's add our own sender details
                        "sender": {
                            "company": `${agentdetails[0].agentFullName}`,
                            "address": `${agentdetails[0].phone}`,
                            "country": `${agentdetails[0].email}`
                        },
                    
                        // Of course we would like to use our own logo and/or background on this invoice. There are a few ways to do this.
                        "images": {
                            //      Logo:
                            // 1.   Use a url
                            logo: fs.readFileSync('invoices/HOMIE.png', 'base64')
                            /*
                               2.   Read from a local file as base64
                                    logo: fs.readFileSync('logo.png', 'base64'),
                               
                             */
                        },
                    
                        // Let's add some standard invoice data, like invoice number, date and due-date
                        "information": {
                            // Invoice number
                            "number": `${invoicenumber}`,
                            // Invoice data
                            "date": `${date}`,
                            // Invoice due date
                        },
                    
                        // Now let's add some products! Calculations will be done automatically for you.
                        
                        "products": [ 
                            {
                                "quantity": "1",
                                "description": `${repairname}`,
                                "tax-rate": 0,
                                "price": `${repairs}`
                            },
                            {
                                "quantity": "1",
                                "description": "Rent",
                                "tax-rate": 10,
                                "price": `${rental}`
                            }
                        ],
                    
                        // We will use bottomNotice to add a message of choice to the bottom of our invoice
                        "bottom-notice": "Please note...VAT % goes towards Agent Fees",
                    
                        // Here you can customize your invoice dimensions, currency, tax notation, and number formatting based on your locale
                        "settings": {
                            "currency": "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
                            /* 
                             "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')         
                             "tax-notation": "gst", // Defaults to 'vat'
                             // Using margin we can regulate how much white space we would like to have from the edges of our invoice
                             "margin-top": 25, // Defaults to '25'
                             "margin-right": 25, // Defaults to '25'
                             "margin-left": 25, // Defaults to '25'
                             "margin-bottom": 25, // Defaults to '25'
                             "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
                             "height": "1000px", // allowed units: mm, cm, in, px
                             "width": "500px", // allowed units: mm, cm, in, px
                             "orientation": "landscape", // portrait or landscape, defaults to portrait         
                             */
                        },
                    
                        /*
                            Last but not least, the translate parameter.
                            Used for translating the invoice to your preferred language.
                            Defaults to English. Below example is translated to Dutch.
                            We will not use translate in this sample to keep our samples readable.
                         */
                        "translate": {
                            "products": "Services", // Defaults to 'Products'
                            "quantity": "", // Default to 'Quantity'
                            "invoice": "Statement Of Accounts",  // Default to 'INVOICE'
                            "due-date": "", // Defaults to 'Due Date'
                            "vat": "Agent Fee", // Defaults to 'Due Date'

        
        
                            /*
                             "invoice": "FACTUUR",  // Default to 'INVOICE'
                             "number": "Nummer", // Defaults to 'Number'
                             "date": "Datum", // Default to 'Date'
                             "due-date": "Verloopdatum", // Defaults to 'Due Date'
                             "subtotal": "Subtotaal", // Defaults to 'Subtotal'
                             "products": "Producten", // Defaults to 'Products'
                             "quantity": "Aantal", // Default to 'Quantity'
                             "price": "Prijs", // Defaults to 'Price'
                             "product-total": "Totaal", // Defaults to 'Total'
                             "total": "Totaal" // Defaults to 'Total'        
                             */
                        },
                    
                        /*
                            Customize enables you to provide your own templates.
                            Please review the documentation for instructions and examples.
                            Leave this option blank to use the default template
                         */
                        "customize": {
                            // "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
                        }, 
        
                        
                    };
         
              }
                  easyinvoice.createInvoice(data, function (result) {
                //The response will contain a base64 encoded PDF file
                var pdf = result.pdf;
            
                //Now let's save our invoice to our local filesystem
                fs.writeFileSync("invoices/invoice "+uniqid()+".pdf", pdf, 'base64'); 
              }); 

              req.flash('message','report created');
              res.redirect('/generatestatement');
        })

        })
    })

    })
})







router.get('*',function(req, res){
    res.render('pagenotfound');
  }); 


module.exports = router;
const mysql = require('mysql'); 
const express = require('express'); 

require('dotenv').config(); 

const dbconnection = mysql.createConnection({
        host: process.env.HOST,
        user:process.env.USERNAME, 
        password:process.env.PASSWORD, 
        database:process.env.DBNAME,
        dateStrings:true,
}); 

dbconnection.connect((err)=>{
    if(err){
        console.log(err.message);
    } 
    console.log("database connected successfully...");
}); 

module.exports= dbconnection;
/*
    Name: sunghwan kwon
    ID: skwon25
    Heroku Link: 
    
*/

var HTTP_PORT = process.env.PROT || 3000;
var express = require("express");
var app = express();


app.get("/", (req,res)=>{
    res.send("Sunghwan Kwon, skwon25");
});

app.listen(HTTP_PORT);

//git init means that creates local repository
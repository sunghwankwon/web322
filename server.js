/*
    Name: sunghwan kwon
    Num: 156028177
    Heroku Link: 
    
*/

var HTTP_PORT = process.env.PROT || 8080;
var express = require("express");
var app = express();
~

app.get("/", (req,res)=>{
    res.send("Sunghwan Kwon, 156028177");
});

app.listen(HTTP_PORT);

//git init means that creates local repository
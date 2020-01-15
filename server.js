/*
    This is solely my work.
    Name: sunghwan kwon
    ID: skwon25
    Heroku Link: https://git.heroku.com/guarded-bayou-54854.git
    
*/

var HTTP_PORT = process.env.PROT || 8080;
var express = require("express");
var app = express();

app.get("/", (req,res)=>{
    res.send("Sunghwan Kwon, skwon25");
});

app.listen(HTTP_PORT);

//git init means that creates local repository
/*
    This is solely my work.
    Name: sunghwan kwon
    ID: skwon25 
    “Each student should be aware of the College's policy regarding Cheating and Plagiarism. 
    Seneca's Academic Policy will be strictly enforced.To support academic honesty at Seneca College, 
    all work submitted by students may be reviewed for authenticity and originality, utilizing software tools and third party services. 
    Please visit the Academic Honesty site on http://library.senecacollege.ca for further information regarding cheating and plagiarism policies and procedures
*/
//https://gentle-ocean-35853.herokuapp.com/
var HTTP_PORT = process.env.PORT || 8080;
var express = require("express"); 
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const exphbs = require ("express-handlebars");
var dataServer = require("./data-service.js");
const bodyParser = require('body-parser');
var app = express();

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);

}
var userSchema = new  Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
})

app.use(express.static('public'));
// Register handlebars as the rendering engine for views
app.engine(".hbs", exphbs({ extname: ".hbs" ,defaultLayout: "main", helpers: {       
    navLink: function(url, options){
    return '<li' +
   ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
   '><a href="' + url + '">' + options.fn(this) + '</a></li>';}
}
}));
app.use(bodyParser.urlencoded({ extended: false }));
const DBURL = "mongodb+srv://dbshskwon:skwon25@cluster0-hopic.mongodb.net/<dbname>?retryWrites=true&w=majority";
mongoose.connect(DBURL, { useNewUrlParser: true,})
  //The then block will only be executed if the above-mentioned line is successful
  .then(() => {
    console.log(`Database is connected`)
})
//The catch block will only be executed if the connection failed
.catch(err => {
    console.log(`Something went wrong : ${err}`);
});

app.set("view engine", ".hbs");

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
    });
  
  app.get("/", function(req,res){
    dataServer.getAllMeals().then((data) => {
      res.render("home", {meals: data});
     })
     .catch((err) => {
         console.log(err);
         res.json(err);
     })
    });
  
  app.get("/log-in", function(req,res){
      res.render("log-in");
    });

    app.get("/package", function (req, res) {
      dataServer.getAllPackages().then((data) => {
        res.render("MealsPackage", {packages: data});
       })
       .catch((err) => {
           console.log(err);
           res.json(err);
    });
       });
  app.get("/registeration", function (req, res) {
        res.render("registeration")
      });
//app.listen(HTTP_PORT, onHttpStart);
console.log ("Ready for initialize");
dataServer.initialize()
.then(() => {
  app.listen(HTTP_PORT, onHttpStart); 
})

app.post("/log-in", (req, res) => {
  //Server-Side validation 

  const errors = [];

  if (req.body.email == "") {
      errors.push("Please enter an email")
  }

  if (req.body.password == "") {
      errors.push("Please enter a password")
  }
  if (errors.length > 0) {

    res.render("log-in",
        {
            message: errors
        })
}
});
app.post("/registeration", (req, res) => {

  //Server-Side validation 

  const errors = [];
  
  if (req.body.firstName == "") {
      errors.push("Please enter your first name");
  }

  if (req.body.lastName == "") {
      errors.push("Please enter your last name");
  }

  if (req.body.email == "") {
    errors.push("Please enter an email");
}
  if (req.body.password == "") {
      errors.push("Please enter a password")
  } else {
      const match = req.body.password.match(/^.{5,12}$/);
      if (match == null) {
          errors.push("Password must be between 5 and 12 characters.");
      }
  }
  if (errors.length > 0){
    res.render("registeration",
            {
                message: errors
            });
  }  else {


        // SEND THE EMAIL
        const mailgun = require("mailgun-js");
        const DOMAIN = "sandboxa116b709a59443ec96d970dc05ba61de.mailgun.org";
        const mg = mailgun({apiKey: "f6a493cc9838e6aa678a1cd4217e0320-468bde97-268fe984", domain: DOMAIN});
        const data = {
          from: 'socom20096@gmail.com',
          to: `${req.body.email}`,
          subject:'Welcome to Live Fit Food!',
          text: `Hi ${req.body.firstName}, thank you for signing up!`
        };
        
        mg.messages().send(data, (error, body) => {
          console.log('sending email');
          if (error) {
        console.log(error);
    }
        });

        //This creates a Model called Users. This model represents our Collection in our database
        const Users = mongoose.model('Users', userSchema);

        const formData = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password
        }
        //To create a  Task document we have to call the Model constructor
        const u = new Users(formData);
        u.save()
            .then(() => {
                console.log('Task was inserted into database')
            })
            .catch((err) => {
                console.log(`Task was not inserted into the database because ${err}`)
            })

        //REDIRECT THE USER TO THE DASHBOARD ROUTE
        res.redirect("/dashboard");
    }
});
app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/", (req, res) => {
  res.render("home");
});

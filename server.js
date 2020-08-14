const express = require("express");
const path = require("path");
const data = require("./data-service.js");
const clientSessions = require("client-sessions");
const dataServiceAuth = require("./data-service-auth.js");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require("multer");
const exphbs = require('express-handlebars');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    defaultLayout: "main",
    helpers: { 
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    } 
}));

app.set('view engine', '.hbs');

// Setup client-sessions
app.use(clientSessions({
  cookieName: "session",
  secret: "web322_long_strings_for_safe",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60 
}));

const storage = multer.diskStorage({
    destination: "./public/images",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


// custom middleware to add "session" to all views (res)
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }
  function ensureLogin2(req, res, next) {
    if (!req.session.user.isAdmin) {
      res.redirect("/login");
    } else {
      next();
    }
  }

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.get("/", (req,res) => {
  data.getAllMeals().then((data) => {
    res.render("home", (data.length > 0) ? {meals:data} : { message: "no results" });
}).catch((err) => {
    res.render("home",{ message: "no results" });
});
});

app.get("/package", (req,res) => {
  data.getAllPackages().then((data) => {
    res.render("package", (data.length > 0) ? {packages:data} : { message: "no results" });
}).catch((err) => {
    res.render("package",{ message: "no results" });
});
});
app.get("/package/add",ensureLogin2, (req,res) => {
  res.render("addPackage");
});

app.get("/addPackage",ensureLogin, (req,res) => {
    res.render("addPackage");
});

app.get("/Cart",ensureLogin, (req,res) => {
  res.render("Cart");
});

  app.post("/package/add",ensureLogin, (req, res) => {
    data.addPackage(req.body).then(()=>{
      res.redirect("/package"); 
    }).catch((err)=>{
        res.status(500).send("Unable to Add the Package");
      });
  });
   

  app.get("/description/:mealID", (req,res)=>{
    let viewData = {};

    data.getMealByNum(req.params.mealID).then((data)=>{
      if (data) {
        viewData.meals = data;
    } else {
        viewData.meals = null; 
    }
      
    }).catch(()=>{
      viewData.meals = null; 
    }).then(() => {
      if (viewData.meals == null) { 
          res.status(404).send("meal Not Found");
      } else {
        res.render("description",{ viewData: viewData }); 
      }
  }).catch((err)=>{
      res.status(500).send("Unable to Show Meals");
    });
  });
  
  app.get("/descriptionPack/:packID", (req,res)=>{
    let viewData = {};

    data.getPackByNum(req.params.packID).then((data)=>{
      if (data) {
        viewData.packages = data;
    } else {
        viewData.packages = null;
    }
      
    }).catch(()=>{
      viewData.packages = null; 
    }).then(() => {
      if (viewData.packages == null) { 
          res.status(404).send("Package Not Found");
      } else {
        res.render("descriptionPack",{ viewData: viewData });
      }
  }).catch((err)=>{
      res.status(500).send("Unable to Show Package");
    });
  });

  app.get("/login", (req,res)=>{
    res.render("login");
  });
  
  app.get("/register", (req,res)=>{
    res.render("register");
  });
  
  app.post('/register', (req,res)=>{
    dataServiceAuth.registerUser(req.body).then(()=>{
      res.render("dashboard");
    }).catch((err)=>{
      res.render("register", {errorMessage: err, userName: req.body.userName});
    });
    
  });
  
  app.post("/login", (req, res) => {

    req.body.userAgent = req.get('User-Agent');
  
    dataServiceAuth.checkUser(req.body).then((user) => {

    req.session.user = {
        fitsrName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
    }

        res.redirect('/');
    }).catch((err) => {
      res.render("login", {errorMessage: err, email: req.body.email});
    });
  });
  
  app.get("/logout", (req,res)=>{
    req.session.reset();
    res.redirect('/');
  })

  app.get("/userHistory", ensureLogin, (req,res)=>{
      res.render("userHistory");
  });

app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

data.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

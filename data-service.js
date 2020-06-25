const fs = require("fs");
var meals = [];
var packages = [];

module.exports.initialize = function () {

    var promise = new Promise((resolve, reject) => {
       
        try {

            fs.readFile('./data/meals.json', (err, data) => {
                if (err) throw err;

                meals = JSON.parse(data);
            })
            
            fs.readFile('./data/packages.json', (err, data) => {
                if (err) throw err;

                packages = JSON.parse(data);
            })

        } catch (ex) {
                      reject("INITIALIZING FAILURE");
                     }
        resolve("INITIALIZING SUCCESS.");
    })

    return promise;
};
module.exports.getAllMeals = function () {

    var promise = new Promise((resolve, reject) => {
        
       if(meals.length === 0) {
        var err = "getAllMeals() doesn't have file to read.";
        reject({message: err});
       }  

    resolve (meals);
    })
    return promise;
};
module.exports.getAllPackages = function () {

    var promise = new Promise((resolve, reject) => {
        
       if(packages.length === 0) {
        var err = "getAllPackages() doesn't have file to read.";
        reject({message: err});
       }  

    resolve (packages);
    })
    return promise;
};


const Sequelize = require('sequelize');
const multer = require('multer');
const upload = multer({dest: 'public/images'});
var sequelize = new Sequelize('dbr0tut9pnkk11', 'gzvgpdynuckbqc', '6ed4bb4f2f8967ad08d5d670f985ed78432be09f41218be8286ff317af37b884', {
    host: 'ec2-34-200-15-192.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
}); 



var meals = sequelize.define('meals', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    title: Sequelize.STRING,
    image: { 
        type: Sequelize.BLOB,
      },
    price: Sequelize.FLOAT,
});

var packages = sequelize.define('packages', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    title: Sequelize.STRING,
    info: Sequelize.STRING,
    image: { 
        type: Sequelize.BLOB,
      },
    price: Sequelize.FLOAT,
});

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then( () => {
            resolve();
        }).catch(()=>{
            reject("unable to sync the database");
        });
    });
}

module.exports.getAllMeals = function () {
    return new Promise(function (resolve, reject) {
        meals.findAll().then(function (data) {
            resolve(data);
        }).catch((err) => {
            reject("query returned 0 results");
        });
    });
}
module.exports.getAllPackages = function () {
    return new Promise(function (resolve, reject) {
        packages.findAll().then(function (data) {
            resolve(data);
        }).catch((err) => {
            reject("query returned 0 results");
        });
    });
}
module.exports.addPackage = function (packageData) {
    return new Promise(function (resolve, reject) {

        for (var prop in packageData) {
            if(packageData[prop] == '')
            packageData[prop] = null;
        }

        packages.create(packageData).then(() => {
            resolve();
        }).catch((err)=>{
            console.log(err);
            reject("unable to create the Package");
        });

    });
};

module.exports.getMealByNum = function (mealID) {
    return new Promise(function (resolve, reject) {
        meals.findAll({
            where: {
                id: mealID
            }
        }).then(function (data) {
          
                resolve(data[0]); 
         
        }).catch(() => {
            reject("query returned 0 results");
        });
    });
};
module.exports.getPackByNum = function (packID) {
    return new Promise(function (resolve, reject) {
        packages.findAll({
            where: {
                id: packID
            }
        }).then(function (data) {
          
                resolve(data[0]); 
         
        }).catch(() => {
            reject("query returned 0 results");
        });
    });
};

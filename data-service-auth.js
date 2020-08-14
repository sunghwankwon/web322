const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let Schema = mongoose.Schema;

let userSchema = new Schema({
  email:  {
    type: String,
    unique: true
  },
  password: String,
  firstName: String,
  lastName: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String
  }],
  isAdmin: { type: Boolean, default: false }
});

let User; 


module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
       //let db = mongoose.createConnection("mongodb+srv://skwon25:skwon25password@cluster0.vbhdz.mongodb.net/web322?retryWrites=true&w=majority");
        let db = mongoose.createConnection('mongodb://localhost/web322');

        db.on('error', (err)=>{
            reject(err); 
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {

        if (userData.password.length <6) {
            reject("Passwords are too short, please the password have 6~12");
        } else {

            bcrypt.genSalt(10, function (err, salt) { 
                if (err) {
                        reject("There was an error encrypting the password");
                }else{

                    bcrypt.hash(userData.password, salt, function (err, hash) { 

                        if (err) {
                            reject("There was an error encrypting the password");
                        } else {

                            userData.password = hash;

                            let newUser = new User(userData);
                            
                            newUser.save((err) => {
                                if (err) {
                                    if (err.code == 11000){
                                        reject("User already taken");
                                    } else {
                                        reject("There was an error creating the user: " + err);
                                    }

                                } else {
                                    resolve();
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};


module.exports.checkUser = function(userData){
    return new Promise(function (resolve, reject) {

        User.find({ email: userData.email})
            .exec()
            .then((users) => {
                if(users.length == 0){
                    reject("Unable to find user: " + userData.email);
                }else{

                    bcrypt.compare(userData.password, users[0].password).then((res) => {
                        if(res === true){
                            users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});

                            User.update({ email: users[0].email },
                                { $set: { loginHistory: users[0].loginHistory } },
                                { multi: false })
                            .exec()
                            .then(() => { 
                                resolve(users[0]);
                            })
                            .catch((err) => { 
                                reject("There was an error verifying the user: " + err);
                            });
                        }else{
                            reject("Incorrect Password for user: " + userData.email);
                        }
                    });
                }
            }).catch((err) => {
                reject("Unable to find user: " + userData.email);
            });

     });
};
var _ = require('underscore');
var User = require('../models/User');
var request = require('request');

var validator = require('validator');
var moment = require('moment');
var shuffleSeed = require('shuffle-seed');

var UserController = {};

UserController.createUser = function (email, username, password, callback) {

    if (typeof email !== "string" || !validator.isEmail(email)){
        return callback({
            message: "Incorrect email format"
        });
    }

    if (email.includes('"') || username.includes('"')) {
        return callback({
            message: "Invalid Characters"
        });
    }

    if (!password || password.length < 6){
        return callback({ message: "Password must be 6 or more characters."}, false);
    }

    if (email.length > 50 || username.length > 20) {
        return callback({ message: "Bro ur username too long bro"});
    }

    email = email.toLowerCase();

    User.findOneByEmail(email).exec(function (err, user) {

        if (err) {
            return callback(err);
        }

        if (user) {
            return callback({
                message: 'An account for this email already exists.'
            });
        } else {
            var u = new User();
            u.email = email;
            u.username = username;
            u.password = User.generateHash(password);
            u.save(function (err) {
                if (err) {
                    console.log("Error: Something went wrong...");
                    return callback(err);
                } else {
                    var token = u.generateAuthToken();
                    return callback(null, {token: token});
                }
            });
        }
    });
};

UserController.loginWithToken = function(token, callback){
    User.getByToken(token, function(err, user){
        if (!user || !user.active) {
            return callback(err, token, null);
        }

        return callback(err, token, user);
    });
};

UserController.loginWithPassword = function(email, password, callback){

    if (!password || password.length === 0){
        return callback({
            message: 'Please enter a password'
        });
    }

    if (!validator.isEmail(email)){
        return callback({
            message: 'Incorrect email or password'
        });
    }

    User
        .findOneByEmail(email)
        .select('+password')
        .exec(function(err, user){
            if (err) {
                return callback(err);
            }
            if (!user) {
                return callback({
                    message: "Incorrect email or password"
                });
            }

            if (!user.checkPassword(password)) {

                return callback({
                    message: "Incorrect email or password"
                });
            }

            // yo dope nice login here's a token for your troubles
            var token = user.generateAuthToken();

            if (user.volunteer == true) {
                UserController.addToLog(user.email + " successfully logged in with password", callback);
            }

            return callback(null, token, user);
        });
};



UserController.createUser("karl@gmail.com", "karl", "karlzhu", function (lol) {
    console.log(lol);
});


module.exports = UserController;
const _     = require('underscore');
const async = require('async');
const User  = require('../models/User');

function removeUnverifiedUser(){
    var now = Date.now();

    // Only delete users below checkin
    User.find({'permissions.level' : { $lt : 2 }}, function(err, users) {
        if (err || !users) {
            throw err;
        }

        async.each(users, function (user, callback) {
            if (now - user.timestamp > 172800000){
                console.log('Removing ' + user.email);
                User.findOneAndRemove({'id':user.id}, callback);
            }
        })
    });
}

setInterval(function() {
    removeUnverifiedUser();
}, 3600000);

module.exports = removeUnverifiedUser;

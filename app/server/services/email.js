require('dotenv').load();
var nodemailer = require('nodemailer');
var fs = require('fs');
var handlebars = require('handlebars');
var mongoose = require('mongoose');
var Settings = require('../models/Settings');
var User = require('../models/User');
var date = new Date();


var smtpConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

var transporter = nodemailer.createTransport(smtpConfig);
const validQueues = JSON.parse(fs.readFileSync('config/data/emailQueues.json', 'utf8'));

module.exports = {
    sendTemplateEmail: function(recipient,templateName,dataPack,callback){//templated email
        templateName = templateName.toLowerCase();

        if(validQueues[templateName]['queueName']){
            //compile the template

            var htmlTemplate = fs.readFileSync(validQueues[templateName]['templateLocation']);
            var template = handlebars.compile(htmlTemplate);
            var htmlEmail = template(dataPack);
            var title = validQueues[templateName]['emailTitle'];

            //start sending
            transporter.verify(function(error, success) {//verify the connection
                if (error) {
                    console.log(error);
                    return callback({error:"Cannot connect to SMTP server."});
                }
            });

            var email_message = {//construct the message
                from: process.env.EMAIL_CONTACT,
                to: "davidhui@davesoftllc.com",
                subject: title,
                text: "Your email client does not support the viewing of HTML emails. Please consider enabling HTML emails in your settings, or downloading a client capable of viewing HTML emails.",
                html: htmlEmail
            };

            transporter.sendMail(email_message, function(error,response){//send the email
                if(error){
                    console.log(error,response);
                    return callback({error:"Something went wrong when we attempted to send the email."});
                }
                else{
                    return callback(null, {message:"Success"});
                }
            });
        }
        else{
            return callback({error:"Invalid email queue!"});
        }
    },

    sendBoringEmail : function(recipient,title,message,callback){//plaintext email

        transporter.verify(function(error, success) {//verify the connection
            if (error) {
                console.log(error);
                return callback({error:"Cannot connect to SMTP server."});
            }
        });

        var email_message = {//construct the message
            from: process.env.EMAIL_HOST,
            to: recipient,
            subject: title,
            text: message
        };

        transporter.sendMail(email_message, function(error,response){//send the email
            if(error){
                console.log(error,response);
                return callback({error:"Something went wrong when we attempted to send the email."});
            }
            else{
                return callback(null, {message:"Success"});
            }
        });
    },

    queueEmail : function(recipient,queue,callback){

        queue = queue.toLowerCase();//just in case

        //check if the given queue is valid
        if(validQueues[queue] === null){//invalid
            console.log("Invalid email queue!");
            return callback({error:"Invalid email queue."});
        }
        else{//valid
            var pushObj = {};
            //kinda sketchy
            pushObj['emailQueue.'+validQueues[queue]['queueName']] = recipient;

            Settings.findOneAndUpdate({},{
                $push: pushObj
            },{
                new: true
            }, function(err,settings){
                if(err){
                    console.log(err);
                    return callback({error:"Cannot add email to the queue."});
                }
                else{
                    return callback(null,{message:"Success"});
                }
            });
        }


    },

    flushQueue : function(queue,callback){
        queue = queue.toLowerCase();

        //check if the given queue is valid
        if(validQueues[queue]['queueName'] === null || !validQueues[queue]['canQueue']){//invalid
            console.log("Invalid email queue!");
            return callback({error:"Invalid email queue."});
        }
        else{//valid
            //return all emails from that queue
            Settings.findOne({}, function(err, settings) {
                if(err){
                    return callback({error:"Cannot find the email queue."});
                }
                else{
                    console.log(settings.emailQueue[validQueues[queue]]);//debug

                    //get pending emails from database
                    var emailPendingList = settings.emailQueue[validQueues[queue]['queueName']];

                    //loop through each
                    emailPendingList.forEach(function(element){

                        //return user properties and send email
                        User.getByEmail(element,function(error,user){
                            if(error){
                                return callback({error:"The provided email does not correspond to a user."});
                            }
                            else{
                                //define the dates
                                date.setTime(settings.timeConfirm);
                                const confirmByString = date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                                date.setTime(settings.timeClose);
                                const submitByString = date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                                //fill dataPack
                                var dataPack = {
                                    nickname: user['firstName'],
                                    confirmBy: confirmByString,
                                    dashURL: process.env.ROOT_URL,
                                    submitBy: submitByString
                                };

                                //send the email
                                module.exports.sendTemplateEmail(element,queue,dataPack,function(err){
                                    if(err){
                                        console.log(err);
                                        return callback({error:"Cannot send email when flushing queue."});
                                    }else{
                                        return callback(null,{message:"Success"});
                                    }
                                })
                            }

                        })

                    });
                }

            })
        }
    }
};
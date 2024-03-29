var User = require('./../app/models/user');
var express = require('express');
var cookieParser = require('cookie-parser')
var config = require('./../config'); // get our config file
var axios = require('axios')
var app = express();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

/*  /   = Root directory
   .   = This location
   ..  = Up a directory
   ./  = Current directory
   ../ = Parent of current directory
   ../../ = Two directories backwards */


const userController = {};
app.set('superSecret', config.secret); // secret variable

//this is the function used to authenticate a user.
userController.getAll = function (req, res) {
    User.find({}, function (err, users) {
        res.json(users);
    });
}


userController.create = function (req, res) {
    // create a sample user
    var username = req.body.username
    var password = req.body.password

    var user = new User({
        name: username,
        password: password,
        admin: true
    });
    // save the sample user
    user.save(function (err) {
        if (err) throw err;
        console.log('User saved successfully');
        res.json({ success: true });
    });
}


userController.sports = function (req, res) {
    var sport = req.body.sport
    var stream = req.body.stream
    var streamCookieName = "stream" + stream
    console.log(streamCookieName);
    console.log(sport);

    res.cookie(streamCookieName, sport)

    res.status(200).send('cookie saved');
}

userController.getSportFromCookie = async function (req, res) {
    //Obviously the user will have an authentication to make the request
    //the system pulls from the API only whne the request is done!
    //Barry McGuiGan, straight from Wigan!
    console.log(req.body.stream)
    var _id = req.params.id
    var stream = req.body.stream;
    var category = ""
    switch (stream) {
        case '1':
            category = req.cookies.stream1
            break;
        case '2':
            category = req.cookies.stream2
            break;
        case '3':
            category = req.cookies.stream3
            break;
        case '4':
            category = req.cookies.stream4
            break;
        case '5':
            category = req.cookies.stream5
            break;
        case '6':
            category = req.cookies.stream6
            break;
        default:
            category = "null"
    }
    var url = 'https://newsapi.org/v2/top-headlines?country=us&category=' + category;
    //axios allows you to send params. justification ;).
    //Via the Authorization HTTP header. Bearer optional, do not base 64 encode.
    let response = await axios.get(url,
        {
            headers: {
                "Authorization": "1276443de9e0423fb0b713dedf80ec33"
            }
        })
    if (response.status == 200) {
        res.status(200).send(response.data);
    }
}

userController.getAllScoresForUser = async function (req, res) {
    //Obviously the user will have an authentication to make the request
    //the system pulls from the API only whne the request is done!
    //Barry McGuiGan, straight from Wigan!
    var _id = req.params.id
    var url = 'https://newsapi.org/v2/top-headlines?country=us&category=business';
    //axios allows you to send params. justification ;).


    //Via the Authorization HTTP header. Bearer optional, do not base 64 encode.

    let response = await axios.get(url,
        {
            headers: {
                "Authorization": "1276443de9e0423fb0b713dedf80ec33"
            }
        })
    if (response.status == 200) {
        res.status(200).send(response.data);
    }
}

// GETS A SINGLE USER FROM THE DATABASE
userController.findById = function (req, res) {
    var _id = req.params.id
    User.findById(_id, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
};

//deletes a user
userController.delete = function (req, res) {
    var _id = req.params.id
    User.findByIdAndRemove(_id, function (err, user) {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.status(200).send("User " + user.name + " was deleted.");
    });
};

userController.update = function (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, user) {
        if (err) return res.status(500).send("There was a problem updating the user.");
        res.status(200).send(user);
    });
};


userController.authenticate = function (req, res) {
    // find the user

    //We're looking for a user. How do we delineate a user? What is a user!? 
    //A user is a JSON OBJECT! An instance of a class.. Mongoose allows us to create these things.
    //And life becomes better because of it!

    //But where does the User come from? Introducing Mongoose Modelling :).
    User.findOne({
        name: req.body.name
    }, function (err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

                // if user is found and password is right
                // create a token with only our given payload
                // we don't want to pass in the entire user since that has the password
                const payload = {
                    admin: user.admin
                };
                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: 1440 // expires in 24 hours
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }

        }
    });
};


module.exports = userController;
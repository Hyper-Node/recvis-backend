var express = require('express')
var router = express.Router()

var validator = require("email-validator");
const userModel = require('../models/userModel.js');

var utils = require("../utils.js")

const bcrypt = require('bcrypt');
const BCRYPT_SALT_ROUNDS = 10;

var fs = require("fs");

var jwt = require('jsonwebtoken');
var JWT_SECRET = fs.readFileSync('./secret/jwtRS256.key');
const JWT_EXPIRATION_DURATION = "10h";

router.post('/register', function(req, response) {
    const receivedJson = req.body;
    const email = receivedJson.email;
    const password = receivedJson.password;
    const isValidEmail = validator.validate(email);

    if(email && isValidEmail && password) {
        userModel.isUserAlreadyExists(email, function(err, isUserAlreadyExists){
            if(!err) {
                if(!isUserAlreadyExists) {
                    bcrypt.hash(password, BCRYPT_SALT_ROUNDS, function(err, hash) {
                        userModel.newUser(email, hash, function(err, isSucceeded){
                            if(isSucceeded) {
                                response.send({
                                    "msg": "Successfully created new user.",
                                    "data": {
                                        isSucceded: true
                                    }
                                })
                            } else {
                                response.send({
                                    "msg": "Error occoured during registration process.",
                                    "data": {
                                        isSucceded: false
                                    }
                                })
                            }
                        })
                    });
                } else {
                    response.send({
                        "msg": "This email is already registered.",
                        "data": {
                            isSucceded: false
                        }
                    })
                }
            } else {
                response.send({
                    "msg": "Error occurred during registration.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        })
    } else {
        if(email && !isValidEmail) {
            response.send({
                "msg": "Please provide a valid email.",
                "data": {
                    isSucceded: false
                }
            })
        } else {
            response.send({
                "msg": "Email or password can not be empty.",
                "data": {
                    isSucceded: false
                }
            })
        }
    }
});

router.post('/login', function(req, response) {
    const receivedJson = req.body;
    const email = receivedJson.email;
    const password = receivedJson.password;
    const isValidEmail = validator.validate(email);

    if(email && isValidEmail && password) {
        userModel.getUser(email, function(err, userAcc){
            if(userAcc) {
                bcrypt.compare(password, userAcc.passwordSaltedHash, function(err, isPasswordHashesMatching) {
                    if(isPasswordHashesMatching) {
                        const token = jwt.sign({ "email": email }, JWT_SECRET, { algorithm: 'RS256',  expiresIn: JWT_EXPIRATION_DURATION }, function(err, token) {
                            if(!err) {
                                response.send({
                                    "msg": "Succesfully logged in.",
                                    "data": {
                                        isSucceded: true,
                                        token: token
                                    }
                                })
                            } else {
                                response.send({
                                    "msg": "Server error during login process: "+err,
                                    "data": {
                                        isSucceded: false
                                    }
                                })
                            }
                        })
                    } else {
                        response.send({
                            "msg": "Email or password is incorrect.",
                            "data": {
                                isSucceded: false
                            }
                        })
                    }
                });
            } else {
                response.send({
                    "msg": "Email or password is incorrect.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        });
    } else {

    }
});

module.exports = router
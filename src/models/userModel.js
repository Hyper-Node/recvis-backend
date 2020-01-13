const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    mail: { type: String, required: true, index: true, unique: true },
    passwordSaltedHash: { type: String, required: true }
})

var userModel = mongoose.model('User', userSchema);

module.exports = {
    newUser: function(mail, passwordSaltedHash, callback) {
        var newUser = new userModel({
            mail: mail,
            passwordSaltedHash: passwordSaltedHash
        })

        newUser.save(function (err, newUser) {
            if (err) {
                const isSucceded = false;
                callback(err, isSucceded);
            } else {
                const isSucceded = true;
                callback(null, isSucceded)
            }
        });
    },
    isUserAlreadyExists: function(mail, callback) {
        userModel.findOne({ mail: mail }, function(err, res){
            console.log(err);
            console.log(res);
            callback(err, res)
        });
    },
    getUser: function(mail, callback) {
        userModel.findOne({ mail: mail }, function(err, res){
            console.log(res)
            callback(err, res)
        });
    }
}
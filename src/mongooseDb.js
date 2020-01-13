const mongoose = require('mongoose');

module.exports = {
    initialize: function(mongoUrl, callback) {
        mongoose.connect(mongoUrl, {useNewUrlParser: true});

        var db = mongoose.connection;
        db.on('error', function(){
            const isSucceded = false;
            callback(isSucceded);
        });
        db.once('open', function() {
            const isSucceded = true;
            callback(isSucceded);
        });
    }
}
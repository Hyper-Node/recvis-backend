const mongoose = require('mongoose');

var weightsetSchema = new mongoose.Schema({
    mail: { type: String, required: true, index: true},
    name: { type: String, required: true },
    text: { type: Number, min: 0, max: 1, required: true },
    citation: { type: Number, min: 0, max: 1, required: true },
    image: { type: Number, min: 0, max: 1, required: true },
    formula: { type: Number, min: 0, max: 1, required: true },
})

var collectedDocSchema = new mongoose.Schema({
    mail: { type: String, required: true, index: true},
    documentId: { type: Number, required: true, unique: true},
    title: { type: String, required: true },
    authorsList: { type: [String], required: true }
})

var collectedDocsOrderSchema = new mongoose.Schema({
    mail: { type: String, required: true, index: true, unique: true},
    order: { type: [Number], required: true }
})

var weightsetModel = mongoose.model('WeightsetNew2', weightsetSchema);
var collectedDocModel = mongoose.model('collectedDocs4', collectedDocSchema);
var collectedDocsOrderModel = mongoose.model('collectedDocsOrder3', collectedDocsOrderSchema);

module.exports = {
    getWeightsetList: function(mail, callback) {
        weightsetModel.find({ mail: mail }, function(err, res){
            callback(err, res);
        }).select('_id name text citation image formula')
    },
    addWeightset: function(mail,  weightsetName, textWeight, citationWeight, imageWeight, formulaWeight, callback) {
        var newWeightset = new weightsetModel({
            mail: mail,
            name: weightsetName,
            text: textWeight,
            citation: citationWeight,
            image: imageWeight,
            formula: formulaWeight
        })

        newWeightset.save(function (err, newWeightset) {
            if (!err) {
                const ID = newWeightset._id;
                callback(null, ID)
            } else {
                callback(err, null);
            }
        });
    },
    removeWeightset: function(mail, weightsetID, callback) {
        weightsetModel.remove({"mail": mail, "_id": weightsetID }, function(err, res){
            if(!err) {
                const isSucceeded = res.deletedCount > 0;
                callback(null, isSucceeded)
            } else {
                const isSucceeded = false;
                callback(err, isSucceeded)
            }
        });
    },
    updateWeightset: function(mail, weightsetID, weightsetName, callback) {
        weightsetModel.update({ "mail": mail, "_id": weightsetID}, {"name": weightsetName}, function(err, res){
            callback(err, res)
        });
    },
    appendCollectedDoc: function(mail, documentId, documentTitle, authorsList, callback) {
        var collectedDoc = new collectedDocModel({
            mail: mail,
            documentId: documentId,
            title: documentTitle,
            authorsList: authorsList
        })

        collectedDoc.save(function (err, newWeightset) {
            if (!err) {
                collectedDocsOrderModel.findOneAndUpdate({ "mail": mail}, { $push: { "order": documentId } }, {upsert:true}, function(err, res){
                    if(!err) {
                        const isSucceeded = true;
                        callback(null, isSucceeded)
                    } else {
                        const isSucceeded = false;
                        callback(err, isSucceeded);
                    }
                });
            } else {
                const isSucceeded = false;
                callback(err, isSucceeded);
            }
        });
    },
    removeCollectedDoc: function(userMail, documentId, callback) {
        collectedDocModel.remove({"mail": userMail, "documentId": documentId }, function(err, res){
            if(!err) {
                const isSucceeded = res.deletedCount > 0;

                if(isSucceeded) {
                    collectedDocsOrderModel.updateOne( { "mail": userMail }, { $pullAll: { order: [documentId] } }, function(err, res){
                        if(!err) {
                            callback(null, true)
                        } else {
                            callback(err, false)
                        }
                    })
                } else {
                    callback("This document already does not exists in the user.", isSucceeded)
                }
            } else {
                const isSucceeded = false;
                callback(err, isSucceeded)
            }
        });
    },
    listCollectedDocs: function(userMail, callback) {
        collectedDocModel.find({ mail: userMail }, {'_id': 0}, function(err, collectedDocsList){
            if(!err) {
                callback(null, collectedDocsList);
            } else {
                callback(err, null);
            }
        }).select('documentId title authorsList')
    },
    getCollectedDocsOrder: function(userMail, callback) {
        collectedDocsOrderModel.findOne({ mail: userMail }, {'_id': 0}, function(err, queryResult){
            if(!err) {
                if(queryResult && queryResult.order) {
                    callback(null, queryResult.order);
                } else {
                    callback(null, []);
                }
            } else {
                callback(err, null);
            }
        }).select('order')
    },
    setCollectedDocsOrder: function(userMail, documentOrderList, callback) {
        collectedDocsOrderModel.findOneAndUpdate({ "mail": userMail}, { "order": documentOrderList }, {upsert:true}, function(err, res){
            if(!err) {
                const isSucceeded = true;
                callback(null, isSucceeded)
            } else {
                const isSucceeded = false;
                callback(err, isSucceeded);
            }
        });
    }
}
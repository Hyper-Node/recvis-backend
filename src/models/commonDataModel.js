const mongoose = require('mongoose');

var researchDisciplineWeightset = new mongoose.Schema({
    name: { type: String, required: true, unique: true},
    text: { type: Number, min: 0, max: 1, required: true },
    citation: { type: Number, min: 0, max: 1, required: true },
    image: { type: Number, min: 0, max: 1, required: true },
    formula: { type: Number, min: 0, max: 1, required: true },
})

var researchDisciplineWeightsetModel = mongoose.model('ResearchDisciplineWeightset2', researchDisciplineWeightset);

module.exports = {
    getResearchDisciplineWeightsetList: function(callback) {
        researchDisciplineWeightsetModel.find({}, function(err, res){
            callback(err, res);
        }).select('name text citation image formula')
    },
    addResearchDisciplineWeightsetList: function(name, text, citation, image, formula, callback) {
        var newWeightset = new researchDisciplineWeightsetModel({
            name: name,
            text: text,
            citation: citation,
            image: image,
            formula: formula
        })

        newWeightset.save(function (err, newWeightset) {
            if (!err) {
                const isSucceded = true;
                callback(null, isSucceded)
            } else {
                const isSucceded = false;
                callback(err, isSucceded);
            }
        });
    },
}
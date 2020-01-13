var express = require('express')
var router = express.Router()

const commonDataModel = require('../models/commonDataModel.js');

router.get('/research-discipline-weightset/list', function(req, response) {
    commonDataModel.getResearchDisciplineWeightsetList(function(err, weightsetList){
        if(!err) {
            response.send({
                "msg": "Successfully retreived the research discipline weightset list.",
                "data": {
                    weightsetArray: weightsetList,
                    isSucceded: true
                }
            })
        } else {
            response.send({
                "msg": "System error, unable to list research discipline weightsets.",
                "data": {
                    isSucceded: false
                }
            })
        }
    })
});

router.post('/research-discipline-weightset/add', function(request, response){
    const userMail = request.email;
    if(request.body && request.body.weightsetName && request.body.weightsetComponents) {
        const disciplineWeightsetName = request.body.weightsetName;

        const disciplineWeightsetTextWeight = parseFloat(request.body.weightsetComponents.text);
        const disciplineWeightsetCitationWeight = parseFloat(request.body.weightsetComponents.citation);
        const disciplineWeightsetImageWeight = parseFloat(request.body.weightsetComponents.image);
        const disciplineWeightsetFormulaWeight = parseFloat(request.body.weightsetComponents.formula);


        commonDataModel.addResearchDisciplineWeightsetList(disciplineWeightsetName, disciplineWeightsetTextWeight, disciplineWeightsetCitationWeight, disciplineWeightsetImageWeight, disciplineWeightsetFormulaWeight, function(err, isSucceded){
            if(isSucceded) {
                response.send({
                    "msg": "Succesfully added the research discipline weightset.",
                    "data": {
                        isSucceded: true
                    }
                })
            } else {
                response.send({
                    "msg": "Unable to add the research discipline weightset.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        });
    } else {
        response.send({
            "msg": "Insufficent parameters.",
            "data": {
                isSucceded: false
            }
        })
    }
});

module.exports = router
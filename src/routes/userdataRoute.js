var express = require('express')
var router = express.Router()

var utils = require("../utils.js")

const userdataModel = require('../models/userdataModel.js');

router.get('/weightset/list', function(req, response) {
    const userMail = req.email;

    userdataModel.getWeightsetList(userMail, function(err, weightsetList){
        if(!err) {
            response.send({
                "msg": "Successfully retreived the weightset list.",
                "data": {
                    weightsetArray: weightsetList,
                    isSucceded: true
                }
            })
        } else {
            response.send({
                "msg": "System error, unable to list weightsets.",
                "data": {
                    isSucceded: false
                }
            })
        }
    })
});

router.post('/weightset/add', function(request, response){
    const userMail = request.email;
    if(request.body && request.body.weightsetName && request.body.weightsetComponents) {
        const weightsetName = request.body.weightsetName;
        const weightsetComponents = request.body.weightsetComponents;
        
        const textWeight = weightsetComponents.text;
        const citationWeight = weightsetComponents.citation;
        const imageWeight = weightsetComponents.image;
        const formulaWeight = weightsetComponents.formula;

        userdataModel.addWeightset(userMail, weightsetName, textWeight, citationWeight, imageWeight, formulaWeight, function(err, weightsetID){
            if(weightsetID) {
                response.send({
                    "msg": "Succesfully added the weightset",
                    "data": {
                        weightsetID: weightsetID,
                        isSucceded: true
                    }
                })
            } else {
                response.send({
                    "msg": "System error, unable to add the weightset.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        })
    } else {
        response.send({
            "msg": "Invalid weightset data",
            "data": {
                isSucceded: false
            }
        })
    }
  });

router.post('/weightset/remove', function(request, response){
    const userMail = request.email;
    if(request.body && request.body.weightsetID) {
        const weightsetID = request.body.weightsetID;

        userdataModel.removeWeightset(userMail, weightsetID, function(err, isSucceded){
            if(isSucceded) {
                response.send({
                    "msg": "Succesfully removed the weightset",
                    "data": {
                        isSucceded: true
                    }
                })
            } else {
                response.send({
                    "msg": "System error, unable to remove the weightset.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        })
    } else {
        response.send({
            "msg": "Invalid weightset ID.",
            "data": {
                isSucceded: false
            }
        })
    }
});

router.post('/weightset/update', function(request, response){
    const userMail = request.email;
    if(request.body && request.body.weightsetID && request.body.weightsetName) {
        const weightsetID = request.body.weightsetID;
        const weightsetName = request.body.weightsetName;

        userdataModel.updateWeightset(userMail, weightsetID, weightsetName, function(err, isSucceded){
            if(isSucceded) {
                response.send({
                    "msg": "Succesfully updated the weightset.",
                    "data": {
                        isSucceded: true
                    }
                })
            } else {
                response.send({
                    "msg": "System error, unable to update the weightset.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        })
    } else {
        response.send({
            "msg": "Invalid weightset data.",
            "data": {
                isSucceded: false
            }
        })
    }
});

router.post('/collected-doc/append', function(request, response){
    const userMail = request.email;
    if(request.body && request.body.documentId && request.body.documentTitle) {
        const documentId = request.body.documentId;
        const documentTitle = request.body.documentTitle;
        const authorsList = request.body.authorsList;

        userdataModel.appendCollectedDoc(userMail, documentId, documentTitle, authorsList, function(err, isSucceded){
            if(isSucceded) {
                response.send({
                    "msg": "Succesfully added the collected doc.",
                    "data": {
                        isSucceded: true
                    }
                })
            } else {
                response.send({
                    "msg": "System error, unable to add the collected doc.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        })
    } else {
        response.send({
            "msg": "Invalid collected document data.",
            "data": {
                isSucceded: false
            }
        })
    }
});

router.post('/collected-doc/remove', function(request, response){
    const userMail = request.email;
    if(request.body && request.body.documentId) {
        const documentId = request.body.documentId;
        userdataModel.removeCollectedDoc(userMail, documentId, function(err, isSucceded){
            if(isSucceded) {
                response.send({
                    "msg": "Succesfully removed the collected doc.",
                    "data": {
                        isSucceded: true
                    }
                })
            } else {
                response.send({
                    "msg": "System error, unable to remove the collected doc: "+err,
                    "data": {
                        isSucceded: false
                    }
                })
            }
        })
    } else {
        response.send({
            "msg": "Invalid document ID.",
            "data": {
                isSucceded: false
            }
        })
    }
});

router.get('/collected-doc/list', function(req, response) {
    const userMail = req.email;

    userdataModel.listCollectedDocs(userMail, function(err, collectedDocs){
        if(collectedDocs) {
            userdataModel.getCollectedDocsOrder(userMail, function(err, orderData){
                if(!err) {
                    response.send({
                        "msg": "Succesfully fetched collected docs data.",
                        "data": {
                            isSucceded: true,
                            collectedDocs: collectedDocs,
                            order: orderData
                        }
                    })
                } else {
                    response.send({
                        "msg": "System error, unable to fetch the collected docs order.",
                        "data": {
                            isSucceded: false
                        }
                    })
                }
            })
        } else {
            response.send({
                "msg": "System error, unable to fetch the collected docs.",
                "data": {
                    isSucceded: false
                }
            })
        }
    })
});

router.post('/collected-doc/set-order', function(request, response){
    const userMail = request.email;
    if(request.body && request.body.documentOrderList) {
        const documentOrderList = request.body.documentOrderList;
        
        if(Array.isArray(documentOrderList)) {
            userdataModel.getCollectedDocsOrder(userMail, function(err, orderResult){
                if(!err) {
                    const orderResultLength = orderResult.length;
                    if(orderResultLength === documentOrderList.length && utils.isArraysContainSameElements(orderResult, documentOrderList)) {
                        userdataModel.setCollectedDocsOrder(userMail, documentOrderList, function(err, isSucceded){
                            if(isSucceded) {
                                response.send({
                                    "msg": "Succesfully set the collected docs order.",
                                    "data": {
                                        isSucceded: true
                                    }
                                })
                            } else {
                                response.send({
                                    "msg": "System error, unable to remove the collected doc.",
                                    "data": {
                                        isSucceded: false
                                    }
                                })
                            }
                        })
                    } else {
                        response.send({
                            "msg": "Invalid order data. Collected documents in new order array does not match the old order contents.",
                            "data": {
                                isSucceded: false
                            }
                        })
                    }
                } else {
                    response.send({
                        "msg": "System error, unable to access to collected order data.",
                        "data": {
                            isSucceded: false
                        }
                    })
                }
            })
        } else {
            response.send({
                "msg": "Order data has to be number array.",
                "data": {
                    isSucceded: false
                }
            })
        }
    } else {
        response.send({
            "msg": "Invalid documentOrderList data.",
            "data": {
                isSucceded: false
            }
        })
    }
});
module.exports = router
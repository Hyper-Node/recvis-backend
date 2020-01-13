var express = require('express')
var router = express.Router()

const hyplagBackendModule = require('../hyplagBackendModule.js');

router.post('/compare', function(req, response) {
    const userMail = req.email;
    var sourceDocumentID = req.body.sourceDocumentID;
    var targetDocumentID = req.body.targetDocumentID;
    
    const isRequiredParametersExist = sourceDocumentID && targetDocumentID;
    if(!isRequiredParametersExist) {
        response.send({
            "msg": "Insufficent parameters.",
            "data": {
                isSucceded: false
            }
        })
        return;
    }

    sourceDocumentID = parseInt(sourceDocumentID);
    targetDocumentID = parseInt(targetDocumentID);

    const algorithmResultRequestBody = {
        "algorithms": [
          {
            "algorithmId": "lccs",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "bc",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "enco",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "git",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "cc",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "mathsim",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "bsm",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "sher",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "iplag",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "lcis",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "lccsdist",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "gft",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "lcfs",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "histo",
            "groupRadius": 0,
            "matchThreshold": 0
          },
          {
            "algorithmId": "gct",
            "groupRadius": 0,
            "matchThreshold": 0
          }
        ],
        "srcDocumentId": sourceDocumentID,
        "targetDocumentIds": [
            targetDocumentID
        ]
      };

    hyplagBackendModule.getAlgorithmResults(algorithmResultRequestBody, function(err, algorithmResults){
        if(!err) {
            response.send({
                "msg": "Algorithm results are successfully fetched.",
                "data": {
                    isSucceded: true,
                    algorithmResults: algorithmResults
                }
            })
        } else {
            response.send({
                "msg": "Interval server error during data retreiving process.",
                "data": {
                    isSucceded: false
                }
            })
        }
    })
});

router.post('/document-data', function(req, response) {
    const userMail = req.email;
    var documentID = req.body.documentID;
    
    const isRequiredParametersExist = documentID;
    if(!isRequiredParametersExist) {
        response.send({
            "msg": "Insufficent parameters.",
            "data": {
                isSucceded: false
            }
        })
        return;
    }

    documentID = parseInt(documentID);

    hyplagBackendModule.getDocumentFullData(documentID, function(err, documentData){
        if(!err) {
            response.send({
                "msg": "Document data is successfully fetched.",
                "data": {
                    isSucceded: true,
                    documentData: documentData
                }
            })
        } else {
            response.send({
                "msg": "Interval server error during data retreiving process.",
                "data": {
                    isSucceded: false
                }
            })
        }
    })
});

router.post('/document-meta', function(req, response) {
    const userMail = req.email;
    var documentID = req.body.documentID;
    
    const isRequiredParametersExist = documentID;
    if(!isRequiredParametersExist) {
        response.send({
            "msg": "Insufficent parameters.",
            "data": {
                isSucceded: false
            }
        })
        return;
    }

    documentID = parseInt(documentID);

    hyplagBackendModule.getDocumentMetadata(documentID, function(err, metadata){
        if(!err) {
            response.send({
                "msg": "Document metadata is successfully fetched.",
                "data": {
                    isSucceded: true,
                    metadata: metadata
                }
            })
        } else {
            response.send({
                "msg": "Interval server error during data retreiving process.",
                "data": {
                    isSucceded: false
                }
            })
        }
    })
});


module.exports = router
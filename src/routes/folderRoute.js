var express = require('express')
var router = express.Router()

var utils = require("../utils.js")

const folderModel = require('../models/folderModel.js');
const hyplagBackend = require('../hyplagBackendModule.js');

var multer  = require('multer')
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

router.get('/list', function(req, response) {
    const userMail = req.email;

    folderModel.getFolderList(userMail, function(err, folderList){
        if(!err) {
            response.send({
                "msg": "Successfully retreived the folders.",
                "data": {
                    folderArray: folderList,
                    isSucceded: true
                }
            })
        } else {
            response.send({
                "msg": "System error, unable list folders.",
                "data": {
                    isSucceded: false
                }
            })
        }
    })
});

router.post('/create', function(request, response){
    const userMail = request.email;
    if(request.body && request.body.folderName) {
        const folderName = request.body.folderName;
        folderModel.createFolder(userMail, folderName, function(err, isSucceded){
            if(isSucceded) {
                response.send({
                    "msg": "Succesfully created the folder",
                    "data": {
                        folderName: folderName,
                        isSucceded: true
                    }
                })
            } else {
                response.send({
                    "msg": "System error, unable to create folder.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        })
    } else {
        response.send({
            "msg": "Invalid folder name.",
            "data": {
                isSucceded: false
            }
        })
    }
  });

router.post('/list-files', function(req, response) {
    const userMail = req.email;
    if(req.body && req.body.folderId) {
        const folderId = req.body.folderId;

        folderModel.listFilesOfFolder(userMail, folderId, function(err, res) {
            if(!err) {
                response.send({
                    "msg": "Succesfully retreived the folder content.",
                    "data": {
                        folderData: res,
                        isSucceded: true
                    }
                })
            } else {
                response.send({
                    "msg": "Server error occourred.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        });
    } else {
        response.send({
            "msg": "Invalid folder ID.",
            "data": {
                isSucceded: false
            }
        })
    }
});

router.post('/upload-files', upload.single('userdocs'), function (req, res, next) {
    const userMail = req.email;
    const folderId = req.body.folderId;
    const fileName = req.file.originalname;
    const fileBufferData = req.file.buffer;

    const isRequiredParametersExist = folderId && fileName && fileBufferData;
    if(!isRequiredParametersExist) {
        res.send({
            "msg": "Insufficent parameters.",
            "data": {
                isSucceded: false
            }
        })
        return;
    }

    folderModel.isFolderBelongsToUser(userMail, folderId, function(err, isFolderBelongsToUser) {
        if(!err) {
            if(isFolderBelongsToUser) {
                hyplagBackend.indexFile(fileName, fileBufferData, function(error, result){
                    console.log(error);
                    console.log("result: "+result);
                    if(!error && result) {
                            const hyplagIndex = result;
                            folderModel.isFileWithHyplagIndexExistsInGivenFolder(userMail, folderId, hyplagIndex, function(errr, isFileWithHyplagIndexExistsInGivenFolder){
                                if(!errr) {
                                    if(!isFileWithHyplagIndexExistsInGivenFolder) {
                                        folderModel.saveFile(userMail, folderId, fileName, hyplagIndex, function(err, isFileSaved){
                                            if(isFileSaved) {
                                                res.send({
                                                    "msg": "Successfully saved the file.",
                                                    "data": {
                                                        isSucceded: true
                                                    }
                                                })
                                            } else {
                                                res.send({
                                                    "msg": "Error: "+err,
                                                    "data": {
                                                        isSucceded: false
                                                    }
                                                })
                                            }
                                        });
                                    } else {
                                        res.send({
                                            "msg": "This file already exists in the folder.",
                                            "data": {
                                                isSucceded: false
                                            }
                                        })
                                    }
                                } else {
                                    res.send({
                                        "msg": "Error: "+error,
                                        "data": {
                                            isSucceded: false
                                        }
                                    })
                                }
                            });
                    } else {
                        res.send({
                            "msg": "Error: "+error,
                            "data": {
                                isSucceded: false
                            }
                        })
                    }
                });
            } else {
                res.send({
                    "msg": "This folder does not belong to the user.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        } else {
            res.send({
                "msg": "Error: "+err,
                "data": {
                    isSucceded: false
                }
            })
        }
    });    
  })

module.exports = router
const mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
    fileName: { type: String, required: true},
    hyplagIndex: { type: String, required: true},
    analysisID: { type: String },
    isAnalysisInProgress: { type: Boolean },
})

var folderSchema = new mongoose.Schema({
    mail: { type: String, required: true},
    folderName: { type: String, required: true},
    files: [fileSchema],
    fileCount: { type: Number, required: true}
})

folderSchema.index({mail: 1, folderName: 1}, {unique: true});

var folderModel = mongoose.model('Folder', folderSchema);
var fileModel = mongoose.model('File', fileSchema);

function getFileDataFromGivenFolder(userMail, folderId, hyplagIndex, fileId, callback) {
    folderModel.findOne({ mail: userMail, _id: folderId }, function(err, folder){
        if(!err) {
            if(folder) {
                if(folder.files && folder.files.length > 0) {
                    var matchedFile = null;
                    var err = null;
                    var neighborFilesHyplagIDList = [];
                    for(var i = 0; i < folder.files.length; i++) {
                        const currentFile = folder.files[i];
                        if(hyplagIndex) {
                            if(currentFile.hyplagIndex == hyplagIndex) {
                                matchedFile = currentFile;
                            } else {
                                neighborFilesHyplagIDList.push(currentFile.hyplagIndex);
                            }
                        } else if(fileId) {
                            if(currentFile._id == fileId) {
                                matchedFile = currentFile;
                            } else {
                                neighborFilesHyplagIDList.push(currentFile.hyplagIndex);
                            }
                        } else {
                            err = "Either hyplagIndex or fileId needs to exist.";
                        }
                    }
                    if(matchedFile) {
                        matchedFile.neighborFilesHyplagIDList = neighborFilesHyplagIDList;
                    }
                    if(!err) {
                        callback(null, matchedFile);
                    } else {
                        callback(err, null);
                    }
                } else {
                    const isFileExistsInGivenFolder = false;
                    callback(null, isFileExistsInGivenFolder);
                }
            } else {
                const isFileExistsInGivenFolder = false;
                callback(null, isFileExistsInGivenFolder);
            }
        } else {
            callback(err, null);
        }
    }).select('files');
}

module.exports = {
    createFolder: function(userMail, folderName, callback) {
        var newFolder = new folderModel({
            mail: userMail,
            folderName: folderName,
            fileCount: 0
        })

        newFolder.save(function (err, folder) {
            if (!err) {
                const isSucceded = true;
                callback(null, isSucceded)
            } else {
                const isSucceded = false;
                callback(err, isSucceded);
            }
        });
    },
    getFolderList: function(userMail, callback) {
        folderModel.find({ mail: userMail }, function(err, res){
            if(!err) {
                callback(null, res);
            } else {
                callback(err, null);
            }
        }).select('folderName fileCount');;
    },
    listFilesOfFolder: function(userMail, folderId, callback) {
        folderModel.findOne({ mail: userMail, _id: folderId }, function(err, res){
            if(!err) {
                callback(null, res);
            } else {
                callback(err, null);
            }
        }).select('folderName files');;
    },
    isFolderBelongsToUser: function(userMail, folderId, callback) {
        folderModel.findOne({ mail: userMail, _id: folderId }, function(err, folder){
            if(!err) {
                if(folder) {
                    const isFolderBelongsToUser = true;
                    callback(null, isFolderBelongsToUser);
                } else {
                    const isFolderBelongsToUser = false;
                    callback(null, isFolderBelongsToUser);
                }
            } else {
                callback(err, null);
            }
        }).select('folderName');
    },
    getFileDataFromGivenFolder: function(userMail, folderId, fileId, callback) {
        const hyplagIndex = null;
        getFileDataFromGivenFolder(userMail, folderId, hyplagIndex, fileId, callback);
    },
    isFileWithHyplagIndexExistsInGivenFolder: function(userMail, folderId, hyplagIndex, callback) {
        const fileId = null;
        getFileDataFromGivenFolder(userMail, folderId, hyplagIndex, fileId, function(err, result){
            if(!err) {
                if(result) {
                    const isFileExistsInGivenFolder = true;
                    callback(null, isFileExistsInGivenFolder);
                } else {
                    const isFileExistsInGivenFolder = false;
                    callback(null, isFileExistsInGivenFolder);
                }
            } else {
                callback(err, null);
            }
        })
    },
    saveFile: function(userMail, folderId, fileName, hyplagIndex, callback) {
        var newFile = new fileModel({
            fileName: fileName,
            hyplagIndex: hyplagIndex
        })

        folderModel.findOne({ mail: userMail, _id: folderId }, function(err, folder){
            if(!err && folder) {
                folder.files.push(newFile);
                folder.fileCount++; 
                folder.save(function(err){
                    if(!err) {
                        const isSucceded = true;
                        callback(null, isSucceded);
                    } else {
                        callback(err, null);
                    }
                })
            } else {
                callback((err || "Folder does not exists."), null);
            }
        }).select('files fileCount');
    },
    setFileAnalysisData: function(userMail, folderId, fileId, analysisID, isAnalysisInProgress, callback) {
        folderModel.findOne({ mail: userMail, _id: folderId }, function(err, folder){
            if(!err && folder) {
                var fileObj = folder.files.id(fileId);
                if(fileObj) {
                    fileObj.analysisID = analysisID;
                    fileObj.isAnalysisInProgress = isAnalysisInProgress;

                    folder.save(function(err){
                        if(!err) {
                            const isSucceded = true;
                            callback(null, isSucceded);
                        } else {
                            callback(err, null);
                        }
                    })
                } else {
                    callback("Unable to find the file.", null);
                }
            } else {
                callback((err || "Folder does not exists."), null);
            }
        }).select('files');
    }
}
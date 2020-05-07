var express = require('express')
var router = express.Router()

var utils = require("../utils.js")
const folderModel = require('../models/folderModel.js');
const hyplagBackend = require('../hyplagBackendModule.js');

const similarityModel = require('../models/similarityModel.js');

router.post('/create', function(req, response) {
    const userMail = req.email;
    const folderId = req.body.folderId;
    const fileId = req.body.fileId;
    
    const isRequiredParametersExist = folderId && fileId;
    if(!isRequiredParametersExist) {
        res.send({
            "msg": "Insufficent parameters.",
            "data": {
                isSucceded: false
            }
        })
        return;
    }

    folderModel.getFileDataFromGivenFolder(userMail, folderId, fileId, function(err, fileData){
        if(!err) {
            if(fileData) {
                if(!fileData.isAnalysisInProgress) {
                    if(!fileData.analysisID) {
                        const hyplagId = fileData.hyplagIndex;
                        hyplagBackend.submitAnalysis(hyplagId, function(err, analysisID){
                            if(!err) {
                                if(analysisID) {
                                    const isAnalysisInProgress = true;
                                    folderModel.setFileAnalysisData(userMail, folderId, fileId, analysisID, isAnalysisInProgress, function(err, isSucceded){
                                        if(!err) {
                                            if(isSucceded) {
                                                response.send({
                                                    "msg": "Created the analysis.",
                                                    "data": {
                                                        isSucceded: true
                                                    }
                                                })
                                            } else {
                                                response.send({
                                                    "msg": "Unable to save data.",
                                                    "data": {
                                                        isSucceded: false
                                                    }
                                                })
                                            }
                                        } else {
                                            response.send({
                                                "msg": "Interval server error during data saving process.",
                                                "data": {
                                                    isSucceded: false
                                                }
                                            })
                                        }
                                    });
                                } else {
                                    response.send({
                                        "msg": "Unable to submit analysis.",
                                        "data": {
                                            isSucceded: false
                                        }
                                    })
                                }
                            } else {
                                response.send({
                                    "msg": "Internal error, "+err,
                                    "data": {
                                        isSucceded: false
                                    }
                                })
                            }
                        });
                    } else {
                        response.send({
                            "msg": "Analysis for this file already exists.",
                            "data": {
                                isSucceded: false
                            }
                        })
                    }
                } else {
                    response.send({
                        "msg": "Analysis already in progress.",
                        "data": {
                            isSucceded: false
                        }
                    })
                }
            } else {
                response.send({
                    "msg": "Unable to get the file data.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        } else {
            response.send({
                "msg": "Server related error occourred.",
                "data": {
                    isSucceded: false
                }
            })
        }
    });
});

router.post('/check-status', function(req, response) {
    const userMail = req.email;
    const folderId = req.body.folderId;
    const fileId = req.body.fileId;
    
    const isRequiredParametersExist = folderId && fileId;
    if(!isRequiredParametersExist) {
        response.send({
            "msg": "Insufficent parameters.",
            "data": {
                isSucceded: false
            }
        })
        return;
    }

    folderModel.getFileDataFromGivenFolder(userMail, folderId, fileId, function(err, fileData){
        if(!err) {
            if(fileData) {
                if(fileData.analysisID) {
                    const analysisID = fileData.analysisID;
                    if(fileData.isAnalysisInProgress) {
                        hyplagBackend.isResultReady(analysisID, function(err, isReady){
                            if(!err) {
                                if(isReady) {
                                    const isAnalysisInProgress = false;
                                    folderModel.setFileAnalysisData(userMail, folderId, fileId, analysisID, isAnalysisInProgress, function(err, isSucceded){
                                        if(!err) {
                                            if(isSucceded) {
                                                response.send({
                                                    "msg": "File status check succesfull.",
                                                    "data": {
                                                        isAnalysisReady: true,
                                                        isSucceded: true
                                                    }
                                                })
                                            } else {
                                                response.send({
                                                    "msg": "Unable to save data.",
                                                    "data": {
                                                        isSucceded: false
                                                    }
                                                })
                                            }
                                        } else {
                                            response.send({
                                                "msg": "Interval server error during status check: "+err,
                                                "data": {
                                                    isSucceded: false
                                                }
                                            })
                                        }
                                    });
                                } else {
                                    response.send({
                                        "msg": "File status check succesfull.",
                                        "data": {
                                            isAnalysisReady: false,
                                            isSucceded: true
                                        }
                                    })
                                }
                            } else {
                                response.send({
                                    "msg": "Error occourred during status check: "+err,
                                    "data": {
                                        isSucceded: false
                                    }
                                })
                            }
                        });
                    } else {
                        response.send({
                            "msg": "File status check succesfull.",
                            "data": {
                                isAnalysisReady: true,
                                isSucceded: true
                            }
                        })
                    }
                } else {
                    response.send({
                        "msg": "Analysis is not created for the file.",
                        "data": {
                            isSucceded: false
                        }
                    })
                }
            } else {
                response.send({
                    "msg": "Unable to get the file data.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        } else {
            response.send({
                "msg": "Server related error occourred.",
                "data": {
                    isSucceded: false
                }
            })
        }
    });
});

function isThereAnyAuthorMatch(authorListToCheck, referenceAuthorList) {
    var isThereAnyMatch = false;
    authorListToCheck.forEach(function(author) {
        const indexOfAuthor = referenceAuthorList.findIndex(function(element, i) {
            const isMatched = (element.toLowerCase() == author.toLowerCase());
            return isMatched;
        });
        if (indexOfAuthor >= 0) isThereAnyMatch = true;
    });
    return isThereAnyMatch;
}

function getAuthorMatchStatus(authorListToCheck, referenceAuthorList) {
    var authorMatchStatusList = [];
    authorListToCheck.forEach(function(author) {
        const indexOfAuthor = referenceAuthorList.findIndex(function(element, i) {
            const isMatched = (element.toLowerCase() == author.toLowerCase());
            return isMatched;
        });
        authorMatchStatusList.push(indexOfAuthor);
    });

    return authorMatchStatusList;
}

router.post('/result', function(req, response) {
    const userMail = req.email;
    const folderId = req.body.folderId;
    const fileId = req.body.fileId;

    var minimumSimilarityThreshold = req.body.minimumSimilarityThreshold;
    var maximumDocumentCount = req.body.maximumDocumentCount;
    
    const isRequiredParametersExist = folderId && fileId && (minimumSimilarityThreshold !== null) && (maximumDocumentCount !== null);
    if(!isRequiredParametersExist) {
        response.send({
            "msg": "Insufficent parameters.",
            "data": {
                isSucceded: false
            }
        })
        return;
    }

    minimumSimilarityThreshold = parseFloat(minimumSimilarityThreshold);
    maximumDocumentCount = parseInt(maximumDocumentCount);
    
    if(minimumSimilarityThreshold < 0 || minimumSimilarityThreshold > 100) {
        response.send({
            "msg": "minimumSimilarityThreshold must be a value must be within the following interval: 0 <= val <= 100",
            "data": {
                isSucceded: false
            }
        })
        return;
    } else if (maximumDocumentCount <= 0) {
        response.send({
            "msg": "maximumDocumentCount must be higher than zero.",
            "data": {
                isSucceded: false
            }
        })
        return;
    }


    folderModel.getFileDataFromGivenFolder(userMail, folderId, fileId, function(err, fileData){
        if(!err) {
            if(fileData) {
                if(fileData.analysisID && !fileData.isAnalysisInProgress) {
                    const analysisID = fileData.analysisID;
                    //const analysisID = "20200105-1808-21";
                    const neighborFilesHyplagIDList = fileData.neighborFilesHyplagIDList;

                    hyplagBackend.getAnalysisResult(analysisID, function(err, result){
                        if(!err) {
                            utils.log("getAnalysisResult: "+JSON.stringify(result))
                            const algorithmResultFeedData = hyplagBackend.formAlgorithmResultExpectedDataStructureFromAnalysisResults(result, neighborFilesHyplagIDList);
                            const sourceDocID = hyplagBackend.getSourceDocumentIDFromAnalysisResults(result);

                            utils.log("algorithm result feed data "+JSON.stringify(algorithmResultFeedData))
                            
                            hyplagBackend.getAlgorithmResults(algorithmResultFeedData, function(err, algorithmResults){
                                if(!err) {
                                    utils.log("algorithmResults "+JSON.stringify(algorithmResults));
                                    const algorithmResultKeys = Object.keys(algorithmResults);
                                    utils.log("algorithm result keys "+JSON.stringify(algorithmResultKeys));

                                    var listOfMatchAlgorithms = [];
                                    algorithmResultKeys.forEach(function(algoKey){
                                        const currentFeatureMatchCount = algorithmResults[algoKey].length
                                        utils.log(algoKey+" match count: "+currentFeatureMatchCount);

                                        if(currentFeatureMatchCount > 0) {
                                            listOfMatchAlgorithms.push(algoKey);
                                        }
                                    });


                                    const matchedDocumentIDList = hyplagBackend.createDocumentIDListFromAlgorithmResults(algorithmResults);
                                    const documentIDListToFetchMetadata = matchedDocumentIDList.concat([sourceDocID]);
                                    const structuredPaperAlgorithmResults = hyplagBackend.structureAlgorithmResultsAsPaperIDKeyValue(matchedDocumentIDList, algorithmResults);

                                    utils.log("These algorithms have more than zero result: "+listOfMatchAlgorithms);
                                    utils.log("Number of algorithms that have more than zero result: "+listOfMatchAlgorithms.length);
                                    utils.log("Number of document matched: "+(matchedDocumentIDList.length));
                                    utils.log("documentIDListToFetchMetadata "+JSON.stringify(documentIDListToFetchMetadata))
                                    hyplagBackend.getMultiplePaperMetadataAsync(documentIDListToFetchMetadata).then(function(paperMetadataList) {
                                        const sourceDocMetadata = paperMetadataList.pop();
                                        var sourceDocument = {
                                            "name": sourceDocMetadata.title,
                                            "authors": [],
                                            "journal": sourceDocMetadata.journal,
                                            "year": sourceDocMetadata.year,
                                            "documentId": 0,
                                            "hyplagIdForSourceDoc": sourceDocMetadata.documentId
                                        };
                                        sourceDocMetadata.authors.forEach(function(authorObj) {
                                            console.log(authorObj)
                                            sourceDocument.authors.push(authorObj.name+" "+authorObj.surname)
                                        });

                                        var matchedDocumentList = [];

                                        paperMetadataList.forEach(function(paperMetadata){
                                            if(!paperMetadata) return;
                                            const paperID = paperMetadata.documentId;
                                            var matchedDocumentData = {
                                                "name": paperMetadata.title,
                                                "authors": [],
                                                "journal": paperMetadata.journal,
                                                "year": paperMetadata.year,
                                                "similarities": {
                                                    "text": 0,
                                                    "citation": 0,
                                                    "image": 0,
                                                    "formula": 0,
                                                },
                                                "isCollected": false,
                                                "authorMatches": [],
                                                "isThereAuthorMatch": false,
                                                "documentId": paperMetadata.documentId
                                            };

                                            paperMetadata.authors.forEach(function(authorObj) {
                                                matchedDocumentData.authors.push(authorObj.name+" "+authorObj.surname)
                                            });

                                            const textAlgorithmsKey = "text";
                                            const citationAlgorithmsKey = "citation";
                                            const imageAlgorithmsKey = "image";
                                            const formulaAlgorithmsKey = "formula";

                                            const similarityMultiplierFactor = 100;

                                            const textAlgorithms = hyplagBackend.getAvailableAlgorithmsDataByType(textAlgorithmsKey);
                                            const textAlgorithmCount = textAlgorithms.length;
                                            var textAlgorithmsSimilaritySum = 0;
                                            var textAlgorithmSignificanceSum = 0;
                                            textAlgorithms.forEach(function(currentAlgorithm){
                                                const algorithmID = currentAlgorithm.id;
                                                const algorithmSignificance = currentAlgorithm.significance;
                                                
                                                textAlgorithmSignificanceSum = textAlgorithmSignificanceSum + algorithmSignificance;
                                                const isAlgorithmDetectedSimilarity = structuredPaperAlgorithmResults[paperID][algorithmID];
                                                if(isAlgorithmDetectedSimilarity) {
                                                    const currentSimilarityValue = structuredPaperAlgorithmResults[paperID][algorithmID].value;
                                                    textAlgorithmsSimilaritySum = textAlgorithmsSimilaritySum + (currentSimilarityValue * algorithmSignificance);
                                                }
                                            });
                                            if(textAlgorithmCount > 0) {
                                                matchedDocumentData.similarities.text = (textAlgorithmsSimilaritySum / textAlgorithmSignificanceSum) * similarityMultiplierFactor;
                                            } else {
                                                matchedDocumentData.similarities.text = 0;
                                            }

                                            const citationAlgorithms = hyplagBackend.getAvailableAlgorithmsDataByType(citationAlgorithmsKey);
                                            const citationAlgorithmCount = citationAlgorithms.length;
                                            var citationAlgorithmsSimilaritySum = 0;
                                            var citationAlgorithmSignificanceSum = 0;
                                            citationAlgorithms.forEach(function(currentAlgorithm){
                                                const algorithmID = currentAlgorithm.id;
                                                const algorithmSignificance = currentAlgorithm.significance;

                                                citationAlgorithmSignificanceSum = citationAlgorithmSignificanceSum + algorithmSignificance;
                                                const isAlgorithmDetectedSimilarity = structuredPaperAlgorithmResults[paperID][algorithmID];
                                                if(isAlgorithmDetectedSimilarity) {
                                                    const currentSimilarityValue = structuredPaperAlgorithmResults[paperID][algorithmID].value;
                                                    citationAlgorithmsSimilaritySum = citationAlgorithmsSimilaritySum + (currentSimilarityValue * algorithmSignificance);
                                                }
                                            });
                                            if(citationAlgorithmCount > 0) {
                                                matchedDocumentData.similarities.citation = (citationAlgorithmsSimilaritySum / citationAlgorithmSignificanceSum) * (similarityMultiplierFactor * 10);
                                            } else {
                                                matchedDocumentData.similarities.citation = 0;
                                            }

                                            const formulaAlgorithms = hyplagBackend.getAvailableAlgorithmsDataByType(formulaAlgorithmsKey);
                                            const formulaAlgorithmCount = formulaAlgorithms.length;
                                            var formulaAlgorithmsSimilaritySum = 0;
                                            var formulaAlgorithmSignificanceSum = 0;
                                            formulaAlgorithms.forEach(function(currentAlgorithm){
                                                const algorithmID = currentAlgorithm.id;
                                                const algorithmSignificance = currentAlgorithm.significance;

                                                formulaAlgorithmSignificanceSum = formulaAlgorithmSignificanceSum + algorithmSignificance;
                                                const isAlgorithmDetectedSimilarity = structuredPaperAlgorithmResults[paperID][algorithmID];
                                                if(isAlgorithmDetectedSimilarity) {
                                                    const currentSimilarityValue = structuredPaperAlgorithmResults[paperID][algorithmID].value;
                                                    formulaAlgorithmsSimilaritySum = formulaAlgorithmsSimilaritySum + (currentSimilarityValue * algorithmSignificance);
                                                }
                                            });
                                            if(formulaAlgorithmCount > 0) {
                                                matchedDocumentData.similarities.formula = (formulaAlgorithmsSimilaritySum / formulaAlgorithmSignificanceSum) * similarityMultiplierFactor;
                                            } else {
                                                matchedDocumentData.similarities.formula = 0;
                                            }

                                            const imageAlgorithms = hyplagBackend.getAvailableAlgorithmsDataByType(imageAlgorithmsKey);
                                            const imageAlgorithmCount = imageAlgorithms.length;
                                            var imageAlgorithmsSimilaritySum = 0;
                                            var imageAlgorithmSignificanceSum = 0;
                                            imageAlgorithms.forEach(function(currentAlgorithm){
                                                const algorithmID = currentAlgorithm.id;
                                                const algorithmSignificance = currentAlgorithm.significance;

                                                imageAlgorithmSignificanceSum = imageAlgorithmSignificanceSum + algorithmSignificance;
                                                const isAlgorithmDetectedSimilarity = structuredPaperAlgorithmResults[paperID][algorithmID];
                                                if(isAlgorithmDetectedSimilarity) {
                                                    const currentSimilarityValue = structuredPaperAlgorithmResults[paperID][algorithmID].value;
                                                    imageAlgorithmsSimilaritySum = imageAlgorithmsSimilaritySum + (currentSimilarityValue * algorithmSignificance);
                                                }
                                            });
                                            if(imageAlgorithmCount > 0) {
                                                matchedDocumentData.similarities.image = (imageAlgorithmsSimilaritySum / imageAlgorithmSignificanceSum) * similarityMultiplierFactor;
                                            } else {
                                                matchedDocumentData.similarities.image = 0;
                                            }

                                            if(matchedDocumentData.similarities.text == 0) {
                                                matchedDocumentData.similarities.text = utils.getRandomInt(0,80);
                                            }
                                            if(matchedDocumentData.similarities.citation == 0) {
                                                matchedDocumentData.similarities.citation = utils.getRandomInt(0,80);
                                            }
                                            if(matchedDocumentData.similarities.image == 0) {
                                                matchedDocumentData.similarities.image = utils.getRandomInt(0,80);
                                            }
                                            if(matchedDocumentData.similarities.formula == 0) {
                                                matchedDocumentData.similarities.formula = utils.getRandomInt(0,80);
                                            }
                                            console.log(matchedDocumentData.similarities)


                                            matchedDocumentData.authorMatches = getAuthorMatchStatus(matchedDocumentData.authors, sourceDocument.authors);
                                            matchedDocumentData.isThereAuthorMatch = isThereAnyAuthorMatch(matchedDocumentData.authors, sourceDocument.authors);
                                            console.log(matchedDocumentData);
                                            //The sole purpose of this calculation is for somehow eliminating the documents below the threshold when weights are assumed to be 1 each. The actual global similarity value will depend on weights set by user and this calculation performed at the backend will not be utilized by the front-end anyway.
                                            const globalSimilarityValue = similarityModel.getGlobalSimilarityValue(matchedDocumentData.similarities.text, matchedDocumentData.similarities.citation, matchedDocumentData.similarities.image, matchedDocumentData.similarities.formula);
                                            if(globalSimilarityValue >= minimumSimilarityThreshold) {
                                                matchedDocumentList.push(matchedDocumentData);
                                            }
                                        });

                                        if(matchedDocumentList.length > maximumDocumentCount) {
                                            matchedDocumentList = similarityModel.getSortedViaGlobalSimilarityValueWithMaxNumberOfDocuments(matchedDocumentList, maximumDocumentCount);
                                        }

                                        const data = {
                                            sourceDoc: sourceDocument,
                                            matchedDocs: matchedDocumentList
                                        };

                                        response.send({
                                            "msg": "success",
                                            "data": data
                                        })
                                    }).catch(function(err) {
                                        console.log("Whoops, error while fetching paper metadata with Promise :(");
                                        console.log(err)
                                        response.send({
                                            "msg": err,
                                            "data": {
                                                isSucceded: false
                                            }
                                        })
                                    });
                                } else {
                                    console.log("getAlgorithmResults ERROR");
                                    console.log(err);
                                }
                            })
                        } else {
                            response.send({
                                "msg": "Internal server error: "+err,
                                "data": {
                                    isSucceded: false
                                }
                            })
                        }
                    });
                } else {
                    response.send({
                        "msg": "Result is does not exists for that file.",
                        "data": {
                            isSucceded: false
                        }
                    })
                }
            } else {
                response.send({
                    "msg": "Unable to get the file data.",
                    "data": {
                        isSucceded: false
                    }
                })
            }
        } else {
            response.send({
                "msg": "Server related error occourred.",
                "data": {
                    isSucceded: false
                }
            })
        }
    });
});

module.exports = router
var request = require('request');
const jsonfile = require('jsonfile')
var request = require("request");
const bibtexParse = require('bibtex-parse');

const utils = require("./utils.js")


var HYPLAG_BACKEND_URL = "";
var HYPLAG_USERNAME = "";
var HYPLAG_PASS = "";

var ACTIVE_TOKEN = "";

var DEBUG_OUTOUT_FILE_PATH = "";

var TINY_SCHOLAR_API_IP = "";
var TINY_SCHOLAR_API_PORT = "";

var AVAILABLE_ALGORITHMS_ID_LIST = [];
var AVAILABLE_ALGORITHMS_DATA = {};

function getPaperAuthors(paperId, callback) {
    const REQUEST_URL = HYPLAG_BACKEND_URL + "/document/" + paperId + "/authors";
    request.get(REQUEST_URL, {
        'auth': {
            'bearer': ACTIVE_TOKEN
        }
    }, function(err, res, body) {
        if (!err) {
            if (utils.isJson(body)) {
                const parsedBody = JSON.parse(body);
                if (parsedBody.length > 0) {
                    callback(null, parsedBody);
                } else {
                    callback("Author length is zero.", null);
                }
            } else {
                callback("Response body is not a JSON object.", null);
            }
        } else {
            callback(err, null);
        }
    });
}

function getPaperMetadata(paperId, callback) {
    const REQUEST_URL = HYPLAG_BACKEND_URL + "/document/" + paperId;
    request.get(REQUEST_URL, {
        'auth': {
            'bearer': ACTIVE_TOKEN
        }
    }, function(err, res, body) {
        if (!err) {
            if (utils.isJson(body)) {
                const parsedBody = JSON.parse(body);
                if (parsedBody.documentId) {
                    jsonfile.writeFile(DEBUG_OUTOUT_FILE_PATH, parsedBody, { spaces: 2 }, function(err) {
                        if (err) console.error(err)
                    })
                    getPaperAuthors(paperId, function(err, authorList) {
                        if (!err) {
                            const metaData = {
                                documentId: parsedBody.documentId,
                                title: parsedBody.title,
                                authors: authorList
                            }
                            callback(null, metaData);
                        } else {
                            callback(err, null);
                        }
                    });
                } else {
                    callback("Unexpected response JSON. documentId is expected in the response.", null);
                }
            } else {
                callback("Response body is not a JSON object.", null);
            }
        } else {
            callback(err, null);
        }
    });
}

function getBibtexFromTitle(paperTitle, callback) {
    const host = TINY_SCHOLAR_API_IP;
    var options = {
        method: 'POST',
        url: 'http://'+host+':'+TINY_SCHOLAR_API_PORT+'/get-bibtex-data-from-title',
        headers: 
        {
            'cache-control': 'no-cache',
            'Content-Type': 'application/json' },
        body: { title: paperTitle },
        json: true,
        timeout: 8000
    };

    request(options, function (error, response, body) {
        if (error) {
            console.log(error);
        }

        if(error) {
            callback(error, null);
        } else {
            if(body.data && body.data.bibtex) {
                const bibtex = body.data.bibtex;
                callback(null, bibtex);
            } else {
                callback("Bibtex data is not present in request", null);
            }
        }
    });
}

function getPaperMetadataAsync(paperId) {
    return new Promise(function(resolve, reject) {
        getPaperMetadata(paperId, function(err, res) {
            if (!err) {
                getBibtexFromTitle(res.title, function(err, bibtex){
                    if(!err) {
                        const parsedBibtex = bibtexParse.entries(bibtex);

                        if(parsedBibtex.length > 0) {
                            const parsedMetadataFromBibtex = parsedBibtex[0];
                            const year = parsedMetadataFromBibtex.YEAR || '';
                            const venue = parsedMetadataFromBibtex.JOURNAL || parsedMetadataFromBibtex.BOOKTITLE || '';
                            res.year = year;
                            res.journal = venue;
                        }
                        resolve(res);
                    } else {
                        const year = '';
                        const venue = '';
                        res.year = year;
                        res.journal = venue;
                        resolve(res);
                    }
                });
            } else {
                reject(err);
            }
        });
    });
}

function getAuthToken(backendUrl, username, pass, callback) {
    var options = {
        uri: backendUrl + "/token/create",
        method: 'POST',
        json: {
            "name": username,
            "password": pass
        }
    };

    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var isSucceed = false;
            if (body.token) {
                ACTIVE_TOKEN = body.token;
                utils.log("NEW TOKEN: " + ACTIVE_TOKEN);
                callback(null, !isSucceed);
            } else {
                callback("Body does not contain token.", isSucceed);
            }
        } else {
            var isSucceed = false;
            callback("Unable to generate token.", isSucceed);
        }
    });
}

function allSkippingErrors(promises) {
    return Promise.all(
      promises.map(p => p.catch(error => null))
    )
  }

module.exports = {
    initialize: function(hyplagbackendUrl, username, password, tinyScholarApiIP, tinyScholarApiPort, callback) {
        HYPLAG_BACKEND_URL = hyplagbackendUrl;
        HYPLAG_USERNAME = username;
        HYPLAG_PASS = password;

        TINY_SCHOLAR_API_IP = tinyScholarApiIP;
        TINY_SCHOLAR_API_PORT = tinyScholarApiPort;

        getAuthToken(HYPLAG_BACKEND_URL, HYPLAG_USERNAME, HYPLAG_PASS, function(err, isSucceed) {
            if (!err) {
                callback(null, isSucceed)
            } else {
                callback(err, null);
            }
        })
    },
    refreshToken: function(callback) {
        getAuthToken(HYPLAG_BACKEND_URL, HYPLAG_USERNAME, HYPLAG_PASS, function(err, isSucceed) {
            if (!err) {
                callback(null, true)
            } else {
                callback(err, false);
            }
        })
    },
    getAvilableAlgorithmsData: function(callback){
        var options = {
            method: 'GET',
            url: HYPLAG_BACKEND_URL+'/algorithm',
            headers: 
            {
                "Authorization": "Bearer "+ACTIVE_TOKEN,
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            }
        };

        request(options, function (error, response, body) {
            const statusCode = response.statusCode;
            const successfulResponseCode = 200;
            const resultNotFoundResponseCode = 404;

            if(!error && statusCode == successfulResponseCode) {
                var isJsonBody = utils.isJson(body);
                if(isJsonBody) {
                    var receivedData = JSON.parse(body);
                    callback(null, receivedData);
                } else {
                    callback("Unexpected response format from Hyplag backend.", null);
                }
            } else if(!error && statusCode == resultNotFoundResponseCode) {
                const receivedData = null;
                callback(null, receivedData);
            } else {
                console.log(statusCode);
                console.log(error);
                console.log(body);
                if(body.exception && body.message) {
                    const error = body.message;
                    callback(error, null);
                }  else {
                    const error = "Unexpected error received from a service.";
                    callback(error, null);
                }
            }
        });
    },
    setAvailableAlgorithmsData: function(availableAlgorithmList) {
        AVAILABLE_ALGORITHMS_ID_LIST = [];
        AVAILABLE_ALGORITHMS_DATA = {};

        availableAlgorithmList.forEach(function(algorithmData){
            const algoID = algorithmData.id;
            const algorithmSimilarityFeatureType = algorithmData.similarityFeature;
            const algorithmSignificance = algorithmData.significance;

            AVAILABLE_ALGORITHMS_ID_LIST.push(algoID);

            const isFeatureTypeListExist = AVAILABLE_ALGORITHMS_DATA[algorithmSimilarityFeatureType];
            if(isFeatureTypeListExist) {
                AVAILABLE_ALGORITHMS_DATA[algorithmSimilarityFeatureType].push({id: algoID, significance: algorithmSignificance});
            } else {
                AVAILABLE_ALGORITHMS_DATA[algorithmSimilarityFeatureType] = [];
                AVAILABLE_ALGORITHMS_DATA[algorithmSimilarityFeatureType].push({id: algoID, significance: algorithmSignificance});
            }
        });

        console.log(AVAILABLE_ALGORITHMS_DATA);
    },
    getAvailableAlgorithmsDataByType: function(type) {
        return AVAILABLE_ALGORITHMS_DATA[type];
    },
    getMultiplePaperMetadataAsync: function(paperIdArray) {
        var promiseArray = [];
        paperIdArray.forEach(function(paperId) {
            promiseArray.push(getPaperMetadataAsync(paperId));
        });
        return allSkippingErrors(promiseArray);
    },
    indexFile: function(filename, fileBufferData, callback) {
        var options = {
            method: 'POST',
            url: HYPLAG_BACKEND_URL+'/indexing',
            headers: 
            { 
                "Authorization": "Bearer "+ACTIVE_TOKEN,
                'cache-control': 'no-cache',
                'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
            },
            formData: 
            {
                external_id: 'birkan',
                multipartFile: 
                {
                    value: fileBufferData,
                    options: 
                    {
                        filename: filename,
                        contentType: null 
                    }
                }
            }
        };

        request(options, function (error, response, body) {
            if (error) {
                callback(error, null);
            } else {
                if(response && response.statusCode == "201") {
                    callback(null, body);
                } else {
                    var isJsonBody = utils.isJson(body);
                    if(isJsonBody) {
                        const receivedJson = JSON.parse(body);
                        if(receivedJson.context && receivedJson.context.documentId) {
                            callback(null, receivedJson.context.documentId);
                        } else if (receivedJson.message){
                            callback(receivedJson.message, null);
                        } else {
                            callback("Unexpected response received from main server.", null)
                        }
                    } else {
                        callback("Unknown error", null);
                    }
                }
                //var isDocIdRegexMatch = !isJsonBody && 
            }
        });
    },
    setDebugModeOn: function(outputFile) {
        DEBUG_OUTOUT_FILE_PATH = outputFile;
    },
    submitAnalysis: function(hyplagId, callback) {
        const jsonToSend = {
            "algorithmIds": AVAILABLE_ALGORITHMS_ID_LIST,
            "scopes": [
                "0"
            ],
            "sourceDocumentId": parseInt(hyplagId)
        }

        var options = {
            method: 'POST',
            url: HYPLAG_BACKEND_URL+'/detection',
            qs: {
                external_id: 'birkan',
                resultTimeout: 0
            },
            headers: 
            {
                "Authorization": "Bearer "+ACTIVE_TOKEN,
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            },
            body: jsonToSend,
            json: true 
        };
        
        request(options, function (error, response, body) {
            const statusCode = response.statusCode;
            const analysisCreatedResponseCode = 202;
            const analysisAlreadyCreatedResponseCode = 201;

            if(!error && statusCode == analysisCreatedResponseCode) {
                const analysisID = body;
                callback(null, analysisID);
            } else if(!error && statusCode == analysisAlreadyCreatedResponseCode) {
                const analysisID = body;
                callback(null, analysisID);
            } else {
                if(body.exception && body.message) {
                    const error = body.message;
                    callback(error, null);
                }  else {
                    const error = "Unexpected error received from a service.";
                    callback(error, null);
                }
            }
        });
    },
    isResultReady: function(analysisID, callback) {
        var options = {
            method: 'GET',
            url: HYPLAG_BACKEND_URL+'/result/'+analysisID,
            headers: 
            {
                "Authorization": "Bearer "+ACTIVE_TOKEN,
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            }
        };

        request(options, function (error, response, body) {
            const statusCode = response.statusCode;
            const successfulResponseCode = 200;
            const resultNotFoundResponseCode = 404;

            if(!error && statusCode == successfulResponseCode) {
                const isSucceed = true;
                callback(null, isSucceed);
            } else if(!error && statusCode == resultNotFoundResponseCode) {
                const isSucceed = false;
                callback(null, isSucceed);
            } else {
                console.log(statusCode);
                console.log(error);
                console.log(body);
                if(body.exception && body.message) {
                    const error = body.message;
                    callback(error, null);
                }  else {
                    const error = "Unexpected error received from a service.";
                    callback(error, null);
                }
            }
        });
    },
    getAnalysisResult: function(analysisID, callback) {
        var options = {
            method: 'GET',
            url: HYPLAG_BACKEND_URL+'/result/'+analysisID,
            headers: 
            {
                "Authorization": "Bearer "+ACTIVE_TOKEN,
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            }
        };

        request(options, function (error, response, body) {
            if(!error) {
                const statusCode = response.statusCode;
                const successfulResponseCode = 200;
                const resultNotFoundResponseCode = 404;
    
                if(statusCode == successfulResponseCode) {
                    callback(null, JSON.parse(body));
                } else if(statusCode == resultNotFoundResponseCode) {
                    callback("Result not found.", null);
                } else {
                    if(body.exception && body.message) {
                        const error = body.message;
                        callback(error, null);
                    }  else {
                        const error = "Unexpected error received from a service.";
                        callback(error, null);
                    }
                }
            } else {
                console.log(error);
                callback(error, null)
            }
        });
    },
    getAlgorithmResults: function(jsonToSend, callback) {
        var options = {
            method: 'POST',
            url: HYPLAG_BACKEND_URL+'/result/algorithms',
            headers: 
            {
                "Authorization": "Bearer "+ACTIVE_TOKEN,
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            },
            body: jsonToSend,
            json: true 
        };
        
        request(options, function (error, response, body) {
            const statusCode = response.statusCode;
            const succeedResponseCode = 200;

            if(!error && statusCode == succeedResponseCode) {
                callback(null, body);
            } else {
                if(body.exception && body.message) {
                    const error = body.message;
                    callback(error, null);
                }  else {
                    const error = "Unexpected error received from a service.";
                    callback(error, null);
                }
            }
        });
    },
    formAlgorithmResultExpectedDataStructureFromAnalysisResults: function(analysisResultData, neighborHyplagIDList) {
        var finalDataStructure = {
            "algorithms": [],
            "srcDocumentId": 0,
            "targetDocumentIds": [],
            "availableKeys": []
        };

        const findings = analysisResultData["findings"];
        const findingsKeyList = Object.keys(findings);

        var detectedAlgorithmSet = new Set([]);
        var targetDocumentIDSet = new Set([]);

        neighborHyplagIDList.forEach(function(neighborHyplagID){
            targetDocumentIDSet.add(neighborHyplagID);
        })

        findingsKeyList.forEach(function(key){
            const currentFinding = findings[key];
            if(currentFinding.length > 0) {
                detectedAlgorithmSet.add(key);
                currentFinding.forEach(item => targetDocumentIDSet.add(item))
                finalDataStructure.availableKeys.push(key);
            }
        })

        const detectedAlgorithmArray = Array.from(detectedAlgorithmSet);
        detectedAlgorithmArray.forEach(function(algorithmID){
            const algorithmDataStructure = {
                "algorithmId": algorithmID,
                "groupRadius": 0,
                "matchThreshold": 0
            }
            finalDataStructure.algorithms.push(algorithmDataStructure);
        });

        finalDataStructure.srcDocumentId = parseInt(analysisResultData.configuration.sourceDocumentId);
    
        finalDataStructure.targetDocumentIds = Array.from(targetDocumentIDSet);
    
        return finalDataStructure;
    },
    getSourceDocumentIDFromAnalysisResults: function(analysisResultData) {
        return analysisResultData.configuration.sourceDocumentId;
    },
    createDocumentIDListFromAlgorithmResults: function(algorithmResultsData) {
        var documentIDSet = new Set([]);
        var algorithmKeys = Object.keys(algorithmResultsData);
        algorithmKeys.forEach(function(algorithmKey){
            var currentAlgorithmResultList = algorithmResultsData[algorithmKey];
            currentAlgorithmResultList.forEach(function(resultDatum){
                documentIDSet.add(resultDatum.selectedDoc);
            });
        });

        return Array.from(documentIDSet);
    },
    structureAlgorithmResultsAsPaperIDKeyValue: function(completeDocumentIDList, algorithmResults){
        var restructuredAlgorithmResults = {};

        completeDocumentIDList.forEach(function(ID){
            restructuredAlgorithmResults[ID] = {};
        })

        var algorithmKeys = Object.keys(algorithmResults);
        algorithmKeys.forEach(function(algorithmKey){
            var currentAlgorithmResultList = algorithmResults[algorithmKey];
            currentAlgorithmResultList.forEach(function(resultDatum){
                restructuredAlgorithmResults[resultDatum.selectedDoc][algorithmKey] = resultDatum;
            });
        });

        return restructuredAlgorithmResults;
    },
    getDocumentFullData: function(docId, callback) {
        var options = {
            method: 'GET',
            url: HYPLAG_BACKEND_URL+'/document/'+docId,
            headers: 
            {
                "Authorization": "Bearer "+ACTIVE_TOKEN,
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            }
        };
        
        request(options, function (error, response, body) {
            const statusCode = response.statusCode;
            const successfulResponseCode = 200;
            const resultNotFoundResponseCode = 404;

            if(!error && statusCode == successfulResponseCode) {
                callback(null, JSON.parse(body));
            } else if(!error && statusCode == resultNotFoundResponseCode) {
                callback("Result not found.", null);
            } else {
                if(body.exception && body.message) {
                    const error = body.message;
                    callback(error, null);
                }  else {
                    const error = "Unexpected error received from a service.";
                    callback(error, null);
                }
            }
        });
    },
    getDocumentMetadata: function(docId, callback) {
        var options = {
            method: 'GET',
            url: HYPLAG_BACKEND_URL+'/document/'+docId+"/meta",
            headers: 
            {
                "Authorization": "Bearer "+ACTIVE_TOKEN,
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            }
        };
        
        request(options, function (error, response, body) {
            const statusCode = response.statusCode;
            const successfulResponseCode = 200;
            const resultNotFoundResponseCode = 404;

            if(!error && statusCode == successfulResponseCode) {
                callback(null, JSON.parse(body));
            } else if(!error && statusCode == resultNotFoundResponseCode) {
                callback("Result not found.", null);
            } else {
                if(body.exception && body.message) {
                    const error = body.message;
                    callback(error, null);
                }  else {
                    const error = "Unexpected error received from a service.";
                    callback(error, null);
                }
            }
        });
    },
}
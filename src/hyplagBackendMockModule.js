const utils = require("./utils.js")

function getPaperMetadata(paperId, callback) {
    const metaData = {
        documentId: paperId,
        title: ("This is a mock title: "+utils.generateRandomSmallLetters(5)),
        authors: [
            {
                name: utils.generateRandomSmallLetters(5)
            },
            {
                name: utils.generateRandomSmallLetters(5)
            },
            {
                name: utils.generateRandomSmallLetters(5)
            },
        ]
    }
    callback(null, metaData);
}

function getPaperMetadataAsync(paperId) {
    return new Promise(function(resolve, reject) {
        getPaperMetadata(paperId, function(err, res) {
            if (!err) {
                resolve(res);
            } else {
                reject(err);
            }
        });
    });
}

module.exports = {
    initialize: function(hyplagbackendUrl, username, password, callback) {
        const isSucceed = true;
        callback(null, isSucceed)
    },
    refreshToken: function(callback) {
        callback(null, true);
    },
    getMultiplePaperMetadataAsync: function(paperIdArray) {
        var promiseArray = [];
        paperIdArray.forEach(function(paperId) {
            promiseArray.push(getPaperMetadataAsync(paperId));
        });
        return Promise.all(promiseArray);
    },
    indexFile: function(filename, fileBufferData, callback) {
        const randomDocumentId = utils.generateRandomSmallLetters(10);
        callback(null, randomDocumentId);
    },
    setDebugModeOn: function(outputFile) {
        DEBUG_OUTOUT_FILE_PATH = outputFile;
    },
    submitAnalysis: function(hyplagId, callback) {
        const analysisID = hyplagId+"12";
        callback(null, analysisID);
    },
    isResultReady: function(analysisID, callback) {
        callback(null, true);
    },
    getAnalysisResult: function(analysisID, callback) {
        callback(error, null);
    },
    getAlgorithmResults: function(jsonToSend, callback) {
        
    },
    formAlgorithmResultExpectedDataStructureFromAnalysisResults: function(analysisResultData) {
        var finalDataStructure = {
            "algorithms": [],
            "srcDocumentId": 0,
            "targetDocumentIds": []
        };
    },
    getSourceDocumentIDFromAnalysisResults: function(analysisResultData) {
        return analysisResultData.configuration.sourceDocumentId;
    },
    createDocumentIDListFromAlgorithmResults: function(algorithmResultsData) {
    },
    structureAlgorithmResultsAsPaperIDKeyValue: function(completeDocumentIDList, algorithmResults){
       
    },
    getDocumentFullData: function(docId, callback) {
    },
    getDocumentMetadata: function(docId, callback) {
    }
}
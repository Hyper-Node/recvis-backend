const backendConfig = require("./config/config.js")

var fs = require("fs");

const express = require('express');
const app = express();
const port = backendConfig.port;

const userRoute = require("./routes/userRoute.js")
const folderRoute = require("./routes/folderRoute.js")
const analysisRoute = require("./routes/analysisRoute.js")
const detailedAnalysisRoute = require("./routes/detailedAnalysisRoute.js")
const userdataRoute = require("./routes/userdataRoute.js")
const commonDataRoute = require("./routes/commonDataRoute.js")

const mongooseDb = require("./mongooseDb.js")
var utils = require("./utils.js")

var hyplagBackend;
if(backendConfig.development.isHyplagBackendMocked) {
    hyplagBackend = require('./hyplagBackendMockModule.js');
} else {
    hyplagBackend = require('./hyplagBackendModule.js');
}


var IS_HYPLAG_BACKEND_INITIALIZED = false;
const HYPLAG_BACKEND_REFRESH_TOKEN_INTERVAL_MIN = backendConfig.hyplagBackendRefreshTokenIntervalMin;

const HYPLAG_BACKEND_URL = backendConfig.hyplagBackendUrl;
const HYPLAG_BACKEND_USERNAME = backendConfig.hyplagBackendUsername;
const HYPLAG_BACKEND_PASS = backendConfig.hyplagBackendPass;

const TINY_SCHOLAR_API_IP = backendConfig.tinyScholarApiIP;
const TINY_SCHOLAR_API_PORT = backendConfig.tinyScholarApiPort;

const mongoDbUrl = backendConfig.mongoDbUrl;

var jwt = require('jsonwebtoken');
var JWT_SECRET = fs.readFileSync('./secret/'+backendConfig.secretJWTKeyFileName);

var VALID_CORS_URL = backendConfig.validCorsUrl;

function isValidOrigin(origin) {
    if (origin === VALID_CORS_URL || backendConfig.development.isAnyCORSAccepted) {
        return true;
    } else {
        return false;
    }
}
function onlyValidOriginCorsMiddleware(req, res, next) {
    var origin = req.get('origin');
    if (isValidOrigin(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-File-Name, Authorization");
        res.header("Access-Control-Allow-Credentials", "true");
        next();
    } else {
        res.send({
            "msg": "origin not allowed",
            "data": {}
        });
    }
}
function accessGrantedOnlyWhenInitializationIsCompletedMiddleware(req, res, next) {
    if (IS_HYPLAG_BACKEND_INITIALIZED) {
        next();
    } else {
        res.send({
            "msg": "Hyplag backend is not initialized therefore server is not available",
            "data": {}
        });
    }
}
function verifyAndSetUsermailViaJwtTokenMiddleware(req, res, next){
    if (req.headers.authorization) {
        const authorizationHeaderString = req.headers.authorization;
        const splittedAuthorizationHeader = authorizationHeaderString.split(" ");
        if(splittedAuthorizationHeader.length == 2) {
            const receivedToken = splittedAuthorizationHeader[1];
            
            jwt.verify(receivedToken, JWT_SECRET,  { algorithms: ["RS256"] }, function(err, decoded) {
                if(!err) {
                    req.email = decoded.email;
                    req.isAuthenticated = true;
                    next();
                } else {
                    if(err == "TokenExpiredError: jwt expired") {
                        res.json({
                            "msg": "Token expired. Please login.",
                            "data": {tokenExpired: true}
                        });
                    } else {
                        console.log("ERR: "+err)
                        next();
                    }
                }
            });
        } else {
            next();
        }
    } else {
        next();
    }
}
function onlyAuthenticatedUsersMiddleware(req, res, next) {
    if(!req.isAuthenticated) {
        res.send({
            "msg": "Authentication is required to access.",
            "data": {authenticationError: true}
        });
    } else {
        next();
    }
}

app.use(express.json());

app.use(onlyValidOriginCorsMiddleware);
app.use(accessGrantedOnlyWhenInitializationIsCompletedMiddleware);

app.use('/analysis', verifyAndSetUsermailViaJwtTokenMiddleware, onlyAuthenticatedUsersMiddleware, analysisRoute);
app.use('/detailed-analysis', verifyAndSetUsermailViaJwtTokenMiddleware, onlyAuthenticatedUsersMiddleware, detailedAnalysisRoute);
app.use('/folder', verifyAndSetUsermailViaJwtTokenMiddleware, onlyAuthenticatedUsersMiddleware, folderRoute);
app.use('/userdata', verifyAndSetUsermailViaJwtTokenMiddleware, onlyAuthenticatedUsersMiddleware, userdataRoute);
app.use('/commonData', verifyAndSetUsermailViaJwtTokenMiddleware, onlyAuthenticatedUsersMiddleware, commonDataRoute);
app.use('/user', userRoute);

app.get('*', function(req, response){
    response.status(404).send({
        "msg": "Unable to find the resource on server.",
        "data": {}
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

mongooseDb.initialize(mongoDbUrl, function(isDbConnectionSucceded){
    if(isDbConnectionSucceded) {
        hyplagBackend.initialize(HYPLAG_BACKEND_URL, HYPLAG_BACKEND_USERNAME, HYPLAG_BACKEND_PASS, TINY_SCHOLAR_API_IP, TINY_SCHOLAR_API_PORT, function(err, res) {
            if (!err) {
                hyplagBackend.getAvilableAlgorithmsData(function(err, receivedAlgorithmsData){
                    if(!err) {
                        hyplagBackend.setAvailableAlgorithmsData(receivedAlgorithmsData);

                        IS_HYPLAG_BACKEND_INITIALIZED = true;
                        console.log("Wohoo, hyplagBackend module is initialized!");
                        setInterval(function() {
                            hyplagBackend.refreshToken(function(err, isSucceeded) {
                                if (isSucceeded) {
                                    console.log("Token is refreshed!!");
                                } else {
                                    console.log("Unable to refresh token: " + err);
                                }
                            });
                        }, HYPLAG_BACKEND_REFRESH_TOKEN_INTERVAL_MIN * 60 * 1000);
                    } else {
                        console.log("Unable to retrieve algorithms data!")
                        console.log(err)
                    }
                })
            } else {
                console.log("Unable to initialize hyplagBackend module");
            }
        });
        hyplagBackend.setDebugModeOn("/tmp/backend_hyplag_debug.json");
    } else {
        throw new Error('Unable to establish connection with database.');
    }
})
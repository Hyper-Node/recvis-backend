const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
    throw result.error
}

const port = parseInt(process.env.PORT);
const hyplagBackendRefreshTokenIntervalMin = parseInt(process.env.HYPLAG_BACKEND_REFRESH_TOKEN_INTERVAL_MIN);
const hyplagBackendUrl = process.env.HYPLAG_BACKEND_URL;
const hyplagBackendUsername = process.env.HYPLAG_BACKEND_USERNAME;
const hyplagBackendPass = process.env.HYPLAG_PASS;
const mongoDbUrl = process.env.MONGO_DB_URL;
const validCorsUrl = process.env.VALID_CORS_URL;
const secretJWTKeyFileName = process.env.SECRET_JWT_KEY_FILE_NAME;
const isAnyCORSAccepted = (process.env.IS_ANY_CORS_ACCEPTED === "true");
const isHyplagBackendMocked = (process.env.IS_HYPLAG_BACKEND_MOCKED === "true");

const tinyScholarApiIP = process.env.TINY_SCHOLAR_API_IP;
const tinyScholarApiPort = process.env.TINY_SCHOLAR_API_PORT;

module.exports = {
    port: port,
    hyplagBackendRefreshTokenIntervalMin: hyplagBackendRefreshTokenIntervalMin,
    hyplagBackendUrl: hyplagBackendUrl,
    hyplagBackendUsername: hyplagBackendUsername,
    hyplagBackendPass: hyplagBackendPass,
    mongoDbUrl: mongoDbUrl,
    validCorsUrl: validCorsUrl,
    secretJWTKeyFileName: secretJWTKeyFileName,

    tinyScholarApiIP: tinyScholarApiIP,
    tinyScholarApiPort: tinyScholarApiPort,

    development: {
        isAnyCORSAccepted: isAnyCORSAccepted,
        isHyplagBackendMocked: isHyplagBackendMocked
    }
}
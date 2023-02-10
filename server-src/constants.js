import dotenv from "dotenv";
dotenv.config();

import WWW_CONSTANTS from "../www/views/shared/constants.js";

const CONST = {
    ...WWW_CONSTANTS,
    PORT: `${process.env.PORT || 80}`,
    SSL_PORT: `${process.env.SSL_PORT || 443}`,
    LIST_IP: `${process.env.LIST_IP || '0.0.0.0'}`,
    SSL_KEY: `${process.env.SSL_KEY || '.cert/server.key'}`,
    SSL_CERT: `${process.env.SSL_CERT || '.cert/server.cert'}`,
    api: {
        PRESET_DATASET_DIR: process.env.DATA_PRESET || "data/default",
        USERS_DIR: process.env.DATA_USER || "data/users",
        RESULTS_SUB_DIR: process.env.DATA_RESULTS || "jobs",
        DATASET_SUB_DIR: process.env.DATA_RESULTS || "datasets",
        MAX_FILE_SIZE: 100 * 1024 * 1024
    },
    filenames: {
        JOB_INFO: "job.info",
        JOB_RESULTS: "results.json",
        METADATA: "metadata.csv",
        SERVER_LIST: "api_servers.json"
    },
    python: {
        MLDSP_EXE: process.env.MLDSP_EXE || "MLDSP",
    },
    mldsp: {
        FOLDS: 10
    },
    DATA: {
        DEFAULT: process.env.DATA_DEFAULT || "./data/default",
        USER: process.env.DATA_USER || "./data/user"
    },
    AUTH: {
        authRequired: false,
        auth0Logout: true,
        secret: process.env.SECRET,
        baseURL: `${process.env.SERVER_URL || 'https://localhost'}`,
        clientID: process.env.CLIENT_ID,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        routes: {
            callback: `/success`,
            postLogoutRedirect: `/index`,
            login: false,
        }
    },
    PATH: {
        ROUTES: "server-src/routes",
        LOG: "./log"
    },
    JOBS: {
        ROOT: "./data/user/",
        RESULTS_SUB: "results",
        RECORD_FILENAME: "record.json",
        RESULTS_FILENAME: "results.json",
        STATUS: {
            ERROR: "error",
            OK: "ok",
            PENDING: "pending",
            COMPLETE: "complete",
            RUNNING: "running"
        }  
    }
};

export default CONST;

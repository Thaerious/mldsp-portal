import dotenv from "dotenv";

dotenv.config();

const config = {
    status: {
        ERROR: "error",
        OK: "ok",
        PENDING: "pending",
        COMPLETE: "complete",
    },
    loc: {
        LIST_DATASETS: "/list_datasets",
        SUBMIT_CALCULATION: "/submit_calculation",
        GET_JOBS: "/get_jobs",
        GET_RESULTS: "/get_results",
        REMOVE_RESULT: "/remove_result",
        UPLOAD_DATASET: "/upload-dataset"
    },
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
        METADATA: "metadata.csv"
    },
    python: {
        MLDSP_EXE: process.env.MLDSP_EXE || "MLDSP",
    },
    mldsp: {
        FOLDS: 10
    },
    data: {
        DEFAULT: process.env.DATA_DEFAULT || "./data/default",
        USER: process.env.DATA_USER || "./data/user"
    },
    auth: {
        authRequired: false,
        auth0Logout: true,
        secret: process.env.SECRET,
        baseURL: `${process.env.SERVER_URL}`,
        clientID: process.env.CLIENT_ID,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        routes: {
            callback: `/success`,
            postLogoutRedirect: `/index`,
            login: false,
        }
    },
    LOC: {
        API: "http://127.0.0.1:7632"
    }
};

export default config;

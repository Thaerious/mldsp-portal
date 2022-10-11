import dotenv from "dotenv";
import Logger from "@thaerious/logger";

const logger = Logger.getLogger().channel("debug");

dotenv.config();

const config = {
    status: {
        ERROR: "error",
        OK: "ok",
        PENDING: "pending",
        COMPLETE: "complete"
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
    }
};

export default config;

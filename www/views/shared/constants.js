export default {
    API: {
        CREATE_JOB: "/create_job",
        GET_JOB_RECORD: "/get_job_record",
        LIST_JOBS: "/list_jobs",
        DELETE_JOB: "/delete_job",
        UPLOAD_DATA: "/upload_data",
        START_JOB: "/start_job",
        SET_VALUE: "/set_value",
        ALL_JOBS: "/all_jobs",
        RETRIEVE_RESULTS: "/retrieve_results",
        STATUS: "/status"
    },
    URLS: {
        LIST_DATASETS: "/list_datasets",
        UPLOAD_ZIP_DATA: "/upload_zip_data",
        REMOVE_DATASET: "/remove_dataset",
        SUBMIT_JOB: "/submit_job",
        ANALYTICS: "/analytics"
    },
    STATUS: {
        ERROR: "error",
        OK: "ok",
        PENDING: "pending",
        COMPLETE: "complete",
        RUNNING: "running"
    }        
}
import Path from 'path';
import FS from 'fs';
import config from "./config.js";

/**
 * Creates user space directories based on a user identifier.
 */
class User{
    constructor(id){
        this.id = id;
    }

    /**
     * Create the user dataset path and results path.
     */
    mkDir(){
        const dsPath = Path.join(config.api.USERS_DIR, this.id, config.api.DATASET_SUB_DIR);
        const rPath = Path.join(config.api.USERS_DIR, this.id, config.api.RESULTS_SUB_DIR);
        if (!FS.existsSync(dsPath)) FS.mkdirSync(dsPath, {recursive : true});
        if (!FS.existsSync(rPath)) FS.mkdirSync(rPath, {recursive : true});
        return this;
    }

    /**
     * Retrieve the user's root directory.
     * Use this as the root for other files and directories.
     */
    rootPath(){
        return Path.join(config.api.USERS_DIR, this.id);
    }

    /**
     * Retrieve the full path for a given dataset.
     * If datasetName is omitted return the user's dataset directory.
     */
    datasetPath(datasetName){
        if (!datasetName) return Path.join(config.api.USERS_DIR, this.id, config.api.DATASET_SUB_DIR);
        return Path.join(config.api.USERS_DIR, this.id, config.api.DATASET_SUB_DIR, datasetName);
    }

    /**
     * Retrive the user's result path.
     */
    resultPath(jobid){
        return Path.join(config.api.USERS_DIR, this.id, config.api.RESULTS_SUB_DIR, "" + jobid);
    }
}

export default User;
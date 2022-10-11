import config from "./config.js";
import child_process from "child_process";
import Path from "path";
import FS from "fs";
import User from "./User.js";

class MLDSP{
    constructor(jobRecord){
        this.jobRecord = jobRecord;
        this.userid = jobRecord.userid;
        this.dataset = jobRecord.dataset;
        this.representation = jobRecord.settings.representation;
        this.kvalue = jobRecord.settings.kvalue;
        this.folds = config.mldsp.FOLDS;

        if (!this.representation) throw new Error("Missing setting 'representation'");
        if (!this.kvalue) throw new Error("Missing setting 'kvalue'");

        this.user = new User(this.userid).mkDir();
    }

    async run() {        
        const cmd = 
            `${config.python.MLDSP_EXE} `                       +
            `${this.getDataSetPath()}/fastas/ `                 +
            `${this.getDataSetPath()}/metadata.csv `            +
            `-k ${this.kvalue} `                                +
            `-o ${this.user.resultPath(this.jobRecord.jobid)} ` +
            `-r ${this.jobRecord.jobid} `                       +
            `-f ${this.folds} `                                 +
            `-z -j `                                            ;

        console.log(cmd);
        return this.startProcess(cmd);
    }

    /**
     * Start and record a new process.
     * Will remove self from this.processes when complete.
     * Updates database when complete.
     */
     startProcess(cmd) {
        return new Promise((resolve, reject) => {
            this.processes = child_process.exec(cmd, async (err, stdout, stderr) => {
                if (err) {
                    this.jobRecord.status = config.status.ERROR;
                    reject(err);
                } else {
                    this.jobRecord.status = config.status.COMPLETE;
                    resolve(stdout);
                }
            });
        });
    }

    /**
     * Determine is the dataset is user or default and return the file path.
     */
    getDataSetPath(){
        const presetPath = Path.join(config.api.PRESET_DATASET_DIR, this.dataset);
        const userPath = this.user.datasetPath(this.dataset);

        if (FS.existsSync(userPath)) return userPath;
        else if (FS.existsSync(presetPath)) return presetPath;
        else throw new Error("unknown this.dataset");
    }
}

export default MLDSP;
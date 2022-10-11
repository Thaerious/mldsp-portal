import config from "./config.js";
import { Mutex } from "async-mutex";
import Path from "path";
import FS from "fs";
import loadJSON from "./loadJSON.js";
import getInfoFiles from "./getInfoFiles.js";
import User from "./User.js";

const mutex = new Mutex();

class JobRecord{

    constructor(userid, jobid, jobname, dataset, settings = {}){
        this._jobid = jobid;
        this._jobname = jobname;
        this._dataset = dataset;
        this._status = config.status.PENDING;
        this._settings = settings;

        this._user = new User(userid);
    };

    set status(value)  { this._status = value; }

    get userid()     {return this.user.id;}
    get jobid()      {return this._jobid;}
    get jobname()    {return this._jobname;}
    get dataset()    {return this._dataset;}
    get status()     {return this._status;}    
    get settings()   {return {...this._settings};}
    get infopath()   {return Path.join(this._user.resultPath(this.jobid), config.filenames.JOB_INFO);}
    get resultpath() {return Path.join(this._user.resultPath(this.jobid), config.filenames.JOB_RESULTS);}
    get user()       {return this._user;}

    static fromFile(path){
        const contents = loadJSON(path);
        return new JobRecord(contents.userid, contents.jobid, contents.jobname, contents.dataset, contents.settings);
    }

    toString(){
        return JSON.stringify({
            userid     : this.userid,
            jobid      : this.jobid,
            jobname    : this.jobname,
            dataset    : this.dataset,
            status     : this.status,
            resultpath : this.resultpath,
            settings   : this.settings,
            errorMessage: this.errorMessage
        }, null, 2);
    }
}

class Jobs{

    constructor(){
        this.jobStore = {};      
        this.loaded = false;  
    }
   
    reset(){
        this.jobStore = {};      
        this.loaded = false;  
        return this;
    }

    /**
     * Loads jobRecord files from the results directory.
     */
    onLoad(){
        if (this.loaded) return
        this.loaded = true;
        
        if (!FS.existsSync(config.api.USERS_DIR)){
             FS.mkdirSync(config.api.USERS_DIR, {recursive : true});
        }

        const infoFilePaths =  getInfoFiles(config.api.USERS_DIR);
        
        for (const path of infoFilePaths){
            const record = JobRecord.fromFile(path);
            if (this.jobStore[record.jobid]) throw new Error(`Duplicate job id: ${record.jobid} ${path}`);
            this.jobStore[record.jobid] = record;

            if (!FS.existsSync(record.resultpath)){
                record.status = config.status.ERROR;
                record.errorMessage = `file not found: ${record.filename}`;
            }
            else record.status = config.status.COMPLETE;
        }

        return this;
    }

    /**
     * Adds a new job, returns a unique job id.
     * Writes the job record to infopath.
     * After this method is called all paths will have been created.
     */
    async addJob(userid, jobname, dataset, settings = {}){
        let jobid = await this.nextIndex();
        const jobRecord = new JobRecord(userid, jobid, jobname, dataset, settings);
        const path = Path.parse(jobRecord.infopath).dir;
        if (!FS.existsSync(path)) FS.mkdirSync(path, {recursive : true});
        FS.writeFileSync(jobRecord.infopath, jobRecord.toString());        
        this.jobStore[jobid] = jobRecord;
                
        return jobRecord;
    }

    /**
     * Remove the job record and the job results directory.
     */
    deleteJob(jobid){
        if (!this.hasJob(jobid)) return;
        const record = this.getJob(jobid);
        const path = record.user.resultPath(jobid);
        if (FS.existsSync(path)) FS.rmSync(path, {recursive: true});
        delete this.jobStore[jobid];
    }

    /**
     * Retrieve a list of all job ids associated with a given user id.
     */
    listJobs(userid){
        const jobList = {};
        for (const jobid in this.jobStore){            
            if (this.jobStore[jobid].userid === userid){
                jobList[jobid] = {
                    "jobname" : this.jobStore[jobid].jobname,
                    "dataset" : this.jobStore[jobid].dataset,
                    "status" : this.jobStore[jobid].status,
                    "settings" : this.jobStore[jobid].settings,
                    "jobid" : jobid,                    
                }
                if (this.jobStore[jobid].errorMessage){
                    jobList[jobid]["error-message"] = this.jobStore[jobid].errorMessage;
                }
            }
        }

        return jobList;
    }

    getJob(jobid){
        if (!this.jobStore[jobid]) throw new Error(`Unknown job id: ${jobid}`);
        return this.jobStore[jobid];
    }

    hasJob(jobid){
        return this.jobStore[jobid] !== undefined;
    }


    async nextIndex(){
        const release = await mutex.acquire();
        let index = 0;
        while(this.jobStore[index]) index++;
        release();
        return index;
    }

    static get instance(){
        if (!Jobs._instance) Jobs._instance = new Jobs().onLoad();
        return Jobs._instance;
    }
}

export {Jobs as default, JobRecord};
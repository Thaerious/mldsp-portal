import config from "./config.js";
import FS from "fs";
import Logger from "@thaerious/logger";
import Jobs from "./Jobs.js"
import MLDSP from "./MLDSP.js";

const logger = Logger.getLogger().channel("server");

class SubmitCalculation {
    constructor() {
        this.processes = {};     
        this._runnable = MLDSP;   
    }

    set runnable(aClass){
        this._runnable = aClass;
    }   

    /**
     * Run a single job.
     * Write the results to the jobRecord.resultpath path, as returne from Job.add:JobRecord.
     * The runnable will change the jobRecord status to complete on completion.
     * 
     * @param userid user identifier usually email returned from Auth0
     * @param jobname 
     */
    async run(userid, jobname, dataset, settings) {
        if (!userid) throw new Error("missing parameter userID");
        if (!dataset) throw new Error("missing parameter dataset");
        if (!settings) throw new Error("missing parameter settings");

        const jobRecord = await Jobs.instance.addJob(userid, jobname, dataset, settings);
        const runnable = new this._runnable(jobRecord);
        const result = await runnable.run();

        FS.writeFileSync(jobRecord.resultpath, result);
        FS.writeFileSync(jobRecord.infopath, jobRecord.toString());

        return jobRecord.jobid;
    }
}

const instance = new SubmitCalculation();
async function middleware(req, res, next) {
    const userid = req.oidc.user.email;

    if (!req.body?.jobname)  return res.json({ error: "missing body field jobname" });
    if (!req.body?.dataset)  return res.json({ error: "missing body field dataset" });
    if (!req.body?.settings) return res.json({ error: "missing body field settings" });

    try {
        const jobid = await instance.run(userid, req.body.jobname, req.body.dataset, req.body.settings);
        res.json({
            route : config.loc.SUBMIT_CALCULATION,
            status: config.status.OK,
            jobname: req.body.jobname,
            jobid: jobid,
        });
    } catch (error) {            
        logger.log(`Error in route ${config.loc.SUBMIT_CALCULATION}`);
        logger.log(error);
        if (error.status) {
            res.json({ ...error, route: config.loc.SUBMIT_CALCULATION });
        } else {
            res.json({ status: "error", route: config.loc.SUBMIT_CALCULATION, message: error.message });
        }
    }
}

export { 
    SubmitCalculation, 
    middleware as default
};

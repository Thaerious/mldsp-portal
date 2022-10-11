import config from "./config.js";
import Express from "express";
import Logger from "@thaerious/logger";
import bodyParser from "body-parser";
import Jobs from "./Jobs.js";
import FS from "fs";

const logger = Logger.getLogger().channel("api");
const router = Express.Router();

router.use(bodyParser.json());
router.use(config.loc.GET_RESULTS, getResults);

async function getResults(req, res, next) {
    const userID = req.oidc.user.email;
    const jobID = req.body?.jobid;

    if (!jobID)
        return res.json({
            status: config.status.ERROR,
            route: config.loc.GET_RESULTS,
            userid : userID,
            message: "missing setting 'jobid'",
        });

    try {
        const jobRecord = Jobs.instance.getJob(jobID);
        const results = doGetResults(jobRecord);

        res.json(
            {
                route: config.loc.GET_RESULTS,
                status: config.status.OK,
                userid : userID,                    
                jobid : jobID,
                ...results
            }
        );
    } catch (error) {
        console.log(error);
        res.json({
            status: config.status.ERROR,
            route: config.loc.GET_RESULTS,
            userid : userID,
            jobid : jobID,
            message : error.message
        });
    }
}

function doGetResults(jobRecord) {
    if (!jobRecord){
        throw { message: "unknown job"};
    }
    else if (jobRecord.userid !== jobRecord.userid){
        throw { message: "unknown job"};
    }
    else if (jobRecord.status === config.status.PENDING){
        return {state: jobRecord.status };
    }
    else {
        console.log(jobRecord);
        console.log(jobRecord.resultpath);
        return {
            state: jobRecord.status,
            data : FS.readFileSync(jobRecord.resultpath, "utf-8")
        };
    }
}

export {router as default, getResults};

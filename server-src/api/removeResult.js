import config from "./config.js";
import Express from "express";
import Logger from "@thaerious/logger";
import bodyParser from "body-parser";
import Jobs from "./Jobs.js";

const logger = Logger.getLogger().channel("api");

async function removeResult(req, res, next){
    const userID = req.oidc.user.email;    
    const jobID = req.body?.jobid;

    if (!jobID){
        return res.json({
            status: config.status.ERROR,
            route: config.loc.REMOVE_RESULT,
            userid : userID,
            message: "missing setting 'jobid'",
        });
    }

    try{
        Jobs.instance.deleteJob(jobID);
        res.json({
            route : config.loc.REMOVE_RESULT,
            userid : userID,
            status : config.status.OK
        });
    } catch (error){
        res.json({
            route : config.loc.REMOVE_RESULT,
            userid : userID,
            jobid : jobID,
            status : config.status.ERROR,
            ...error
        });
    }
}

export {removeResult};
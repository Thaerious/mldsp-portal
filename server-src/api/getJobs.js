import config from "./config.js";
import Express from "express";
import Logger from "@thaerious/logger";
import bodyParser from "body-parser";
import Jobs from "./Jobs.js";

const logger = Logger.getLogger().channel("api");

async function getJobs(req, res, next){
    const userID = req.oidc.user.email;    

    try{
        res.json({
            route : config.loc.GET_JOBS,
            userid : userID,
            status : config.status.OK,
            data : await lookupJobs(userID)
        });
    } catch (error){
        res.json({
            route : config.loc.GET_JOBS,
            userid : userID,
            status : config.status.ERROR,
            ...error
        });
    }
}

async function lookupJobs(userID){
    return Jobs.instance.listJobs(userID);
}

export {getJobs as default, lookupJobs};
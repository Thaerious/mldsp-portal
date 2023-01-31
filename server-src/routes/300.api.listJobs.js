import express from "express";
import CONST from "../constants.js";
import pkg from "express-openid-connect";
import { routeFactory } from "../makeRoute.js";
import { fsjson } from "@thaerious/utility";
import postapi from "../postapi.js";

const { requiresAuth } = pkg;
const route = express.Router();
const serverList = fsjson.load(CONST.filenames.SERVER_LIST);

route.use(CONST.API.LIST_JOBS,
    requiresAuth(),
    routeFactory(CONST.API.LIST_JOBS, listJobs)
);

async function listJobs(req) {
    let rvalue = { records: [] };

    for (const serverName in serverList) {     
        const url = `${serverList[serverName]}${CONST.API.LIST_JOBS}`;
        const response = await postapi(url, { "userid": req.oidc.user.email });

        for (const jobid in response.records) {
            response.records[jobid].server = serverName;
            rvalue.records.push(response.records[jobid]);
        }
    }

    return rvalue;    
}

export default route;
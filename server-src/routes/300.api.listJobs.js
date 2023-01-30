import express from "express";
import CONST from "../constants.js";
import pkg from "express-openid-connect";
import { routeFactory } from "../makeRoute.js";
import { fsjson } from "@thaerious/utility";

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
        const form = new FormData();
        form.set("userid", req.oidc.user.email);

        const url = `${serverList[serverName]}${CONST.API.LIST_JOBS}`;

        const response = await fetch(
            url, {
                method: 'POST',
                body: form
            }
        );
        
        const records = (await response.json()).records;
        for (const jobid in records) {
            records[jobid].server = serverName;
            rvalue.records.push(records[jobid]);
        }
    }

    return rvalue;    
}

export default route;
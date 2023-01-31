import express from "express";
import CONST from "../constants.js";
import pkg from "express-openid-connect";
import bodyParser from "body-parser";
import Path from "path";
import handleError from "../handleError.js";
import handleResponse from "../handleResponse.js";
import FS from 'fs';
import Jobs from "../Jobs.js";
import logger from "../setupLogger.js";
import postapi from "../postapi.js";

// Submit a new MLDSP job to the api server.
// First creates a local job record.

const { requiresAuth } = pkg;
const route = express.Router();

const jobs = new Jobs().load();

route.use(CONST.URLS.SUBMIT_JOB,
    bodyParser.json(),
    requiresAuth(),
    submit,
);

async function submit(req, res, next) {
    try {
        const zipPath = Path.join(CONST.DATA[req.body.source.toUpperCase()], req.body.filename + '.zip');
        const record = await createJob(req.oidc.user.email, req.body.description);
        await upload(record, zipPath);
        await startJob(record);
        handleResponse(res, CONST.URLS.SUBMIT_JOB, { jobid: record.jobid });
    } catch (error) {
        handleError(error, CONST.URLS.SUBMIT_JOB, req, res);
    }
}

async function createJob(userid, description) {
    const apiServer = await jobs.nextServer();
    const createURL = Path.join(apiServer.url, CONST.API.CREATE_JOB);       
    
    const json = await postapi(createURL, {
        'userid': userid,
        'description': description
    });
    
    json.record.server = apiServer;
    return json.record;
}

async function upload(record, filename) {
    const uploadURL = Path.join(record.server.url, CONST.API.UPLOAD_DATA);
    const stream = FS.readFileSync(filename);

    const blob = new Blob([stream], {
        type: "application/zip",
    });

    return await postapi(uploadURL, {
        'userid': userid,
        'jobid': record.jobid,
        'fileupload': { 'blob': blob, "filename": filename }
    });
}

async function startJob(record) {
    const startURL = Path.join(record.server.url, CONST.API.START_JOB);

    const json = await postapi(startURL, {
        'userid': userid,
        'jobid': record.jobid        
    });

    return json.jobid;    
}

export default route;
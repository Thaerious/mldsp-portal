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
    const form = new FormData();
    form.set('userid', userid);
    form.set('description', description);

    const apiServer = await jobs.nextServer();
    const createURL = Path.join(apiServer.url, CONST.API.CREATE_JOB);    
    
    logger.veryverbose(`fetching ${createURL}`);
    const response = await fetch(createURL, {
        method: 'POST',
        body: form
    });
    
    const json = await response.json();
    const record = json.record;
    record.server = apiServer;
    return record;
}

async function upload(record, filename) {
    const uploadURL = Path.join(record.server.url, CONST.API.UPLOAD_DATA);
    const stream = FS.readFileSync(filename);

    const blob = new Blob([stream], {
        type: "application/zip",
    });

    const form = new FormData();
    form.set("userid", record.userid);
    form.set("jobid", record.jobid);
    form.set("fileupload", blob, filename);

    logger.veryverbose(`fetching ${uploadURL}`);
    const response = await fetch(uploadURL, {
        method: 'POST',
        body: form
    });
    
    return await response.json();
}

async function startJob(record) {
    const startURL = Path.join(record.server.url, CONST.API.START_JOB);

    const form = new FormData();
    form.set('userid', record.userid);
    form.set('jobid', record.jobid);

    logger.veryverbose(`fetching ${startURL}`);
    const response = await fetch(startURL, {
        method: 'POST',
        body: form
    });

    const data = await response.json();
    return data.jobid;    
}

export default route;
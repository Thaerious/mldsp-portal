import express from "express";
import CONST from "../constants.js";
import pkg from "express-openid-connect";
import bodyParser from "body-parser";
import Path from "path";
import handleError from "../handleError.js";
import handleResponse from "../handleResponse.js";
import FS from 'fs';
import Jobs from "../Jobs.js";
import postapi from "../postapi.js";
import crypto from "crypto";

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

class APIError extends Error{
    constructor(message, record) {
        super(message);
        this.record = record;
    }
}

/**
 * Determine the path of the zip file.
 * The request body must have a source and filename.
 */
function getZipPath(req) {
    switch (req.body.source.toUpperCase()) {
        case "USER":
            return Path.join(CONST.DATA.USER, req.oidc.user.email, req.body.filename + '.zip');
        case "DEFAULT":
            return Path.join(CONST.DATA.DEFAULT, req.body.filename + '.zip');
    }
}

async function submit(req, res, next) {
    try {
        const zipPath = getZipPath(req);
        let record = await createJob(req.oidc.user.email, req.body.description);
        record = await upload(record, zipPath);
        record = await startJob(record);
        handleResponse(res, CONST.URLS.SUBMIT_JOB, { record: record });
    } catch (error) {
        handleError(res, CONST.URLS.SUBMIT_JOB, error, { record: error.record });
    }
}

async function createJob(userid, description) {
    const apiServer = await jobs.nextServer();
    const createURL = Path.join(apiServer.url, CONST.API.CREATE_JOB);

    const response = await postapi(createURL, {
        'userid': userid,
        'description': description
    });

    response.record.server = apiServer;
    if (response.status === CONST.STATUS.ERROR) {
        throw new APIError(response.message, response.record);
    }    

    return response.record;
}

async function upload(record, filename) {
    const uploadURL = Path.join(record.server.url, CONST.API.UPLOAD_DATA);
    const stream = FS.readFileSync(filename);

    const blob = new Blob([stream], {
        type: "application/zip",
    });

    const response = await postapi(uploadURL, {
        'userid': record.userid,
        'jobid': record.jobid,
        'fileupload': { 'blob': blob, "filename": filename }
    });

    response.record.server = record.server;
    if (response.status === CONST.STATUS.ERROR) {
        throw new APIError(response.message, response.record);
    }

    return response.record;
}

async function startJob(record) {
    const startURL = Path.join(record.server.url, CONST.API.START_JOB);

    const response = await postapi(startURL, {
        'userid': record.userid,
        'jobid': record.jobid
    });

    response.record.server = record.server;
    if (response.status === CONST.STATUS.ERROR) {
        console.log(response);
        throw new APIError(response.message, response.record);
    }

    return response.record;
}

export default route;
import express from "express";
import CONST from "../constants.js";
import pkg from "express-openid-connect";
import bodyParser from "body-parser";
import Path from "path";
import { API_CONST } from "mldsp-api";
import handleError from "../handleError.js";
import handleResponse from "../handleResponse.js";
import FS from 'fs';
// import FormData from "form-data";

const { requiresAuth } = pkg;
const route = express.Router();

const uploadURL = Path.join(CONST.LOC.API, API_CONST.URLS.UPLOAD_DATA);
const createURL = Path.join(CONST.LOC.API, API_CONST.URLS.CREATE_JOB);
const startURL = Path.join(CONST.LOC.API, API_CONST.URLS.START_JOB);

route.use(CONST.URLS.SUBMIT_JOB,
    bodyParser.json(),
    requiresAuth(),
    submit,
);

async function submit(req, res, next) {
    try {
        const userid = req.oidc.user.email;
        const zipPath = Path.join(CONST.DATA[req.body.source.toUpperCase()], req.body.filename + '.zip');
        const jobid = await createJob(req.oidc.user.email, req.body.description);

        await upload(userid, jobid, zipPath);
        await startJob(userid, jobid);
        handleResponse(res, CONST.URLS.SUBMIT_JOB);
    } catch (error) {
        handleError(error, CONST.URLS.SUBMIT_JOB, req, res);
    }
}

async function createJob(userid, description) {
    const form = new FormData();
    form.set('userid', userid);
    form.set('description', description);

    const response = await fetch(createURL, {
        method: 'POST',
        body: form
    });

    const data = await response.json();
    return data.jobid;
}

async function upload(userid, jobid, filename) {
    const stream = FS.readFileSync(filename);
    const blob = new Blob([stream], {
        type: "application/zip",
    });

    const form = new FormData();
    form.set("userid", userid);
    form.set("jobid", jobid);
    form.set("fileupload", blob, filename);

    fetch(uploadURL, {
        method: 'POST',
        body: form
    });
}

async function startJob(userid, jobid) {
    const form = new FormData();
    form.set('userid', userid);
    form.set('jobid', jobid);

    const response = await fetch(startURL, {
        method: 'POST',
        body: form
    });

    const data = await response.json();
    return data.jobid;    
}

export default route;
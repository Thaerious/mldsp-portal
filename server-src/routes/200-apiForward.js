import { API_CONST } from "mldsp-api";
import CONST from "../constants.js";
import express from "express";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import multer from "multer";
import FormData from "form-data";
import Path from "path";
import FS from "fs";

const route = express.Router();

let proxyOptions = {
    target: CONST.LOC.API,
    changeOrigin: true,
};

for (const key in API_CONST.URL) {
    const url = API_CONST.URL[key];
    switch (url) {
        case API_CONST.URL.UPLOAD_DATA:
            proxyOptions.onProxyReq = appendFile;
            break;
        default:
            proxyOptions.onProxyReq = appendUserID;
            break;
    }

    route.use(
        url,
        multer({}).none(),
        bodyParser.urlencoded({ extended: false }),
        createProxyMiddleware(proxyOptions)
    );
}

async function appendUserID(proxyReq, req) {
    console.log("appendUserID");

    const args = {
        ...req.body,
        userid: req.oidc.user.email
    }

    const formData = new FormData();

    Object.keys(args).map(key => formData.append(key, args[key]));

    proxyReq.setHeader('content-type', 'application/x-www-form-urlencoded');
    proxyReq.setHeader('content-length', formData.getBuffer().length);
    const body = formData.getBuffer().toString("utf-8");
    console.log(body);
    await proxyReq.write(body);
    proxyReq.end();
}

async function appendFile(proxyReq, req, res) {
    console.log("appendFile");

    const args = {
        ...req.body,
        userid: "user@id"
    }

    const filepath = Path.join(CONST.DATA.DEFAULT, req.body.filename + ".zip");
    const formData = new FormData();

    Object.keys(args).map(key => formData.append(key, args[key]));
    formData.append('fileupload', FS.readFileSync(filepath), 'file.txt');

    proxyReq.setHeader('content-type', `multipart/form-data; boundary=${formData.getBoundary()}`);
    proxyReq.setHeader('content-length', formData.getBuffer().length);

    const body = formData.getBuffer().toString("utf-8");
    await proxyReq.write(body);

    proxyReq.end();
}


export default route;


// [1] https://github.com/chimurai/http-proxy-middleware/blob/master/recipes/modify-post.md
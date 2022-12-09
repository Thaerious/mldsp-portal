import { API_CONST } from "mldsp-api";
import CONST from "../constants.js";
import express from "express";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import FormData from "form-data";
import Path from "path";
import FS from "fs";

const route = express.Router();

let proxyOptions = {
    target: CONST.LOC.API,
    changeOrigin: true,
    onProxyReq: appendUserID
};

for (const key in API_CONST.URL) {
    route.use(
        API_CONST.URL[key],
        bodyParser.json(),
        createProxyMiddleware(proxyOptions)
    );
}

async function appendUserID(proxyReq, req) {
    console.log("appendUserID");
    console.log(req.body);

    const args = {
        ...req.body,
        userid: req.oidc.user.email
    }

    const formData = new FormData();

    Object.keys(args).map(key => formData.append(key, args[key]));

    if (req.body.filename) {
        const filepath = getFilePath(req.body.filename + ".zip", req.oidc.user.email);
        formData.append('fileupload', FS.readFileSync(filepath), req.body.filename + ".zip");
    }

    proxyReq.setHeader('content-type', `multipart/form-data; boundary=${formData.getBoundary()}`);
    proxyReq.setHeader('content-length', formData.getBuffer().length);

    const body = formData.getBuffer().toString("utf-8");
    
    await proxyReq.write(body);
    proxyReq.end();
}

// async function appendFile(proxyReq, req, res) {
//     console.log("appendFile");

//     const args = {
//         ...req.body,
//         userid: req.oidc.user.email
//     }
//     console.log(req.body);

//     const filepath = getFilePath(req.body.filename + ".zip", req.oidc.user.email);
//     const formData = new FormData();

//     Object.keys(args).map(key => formData.append(key, args[key]));

//     formData.append('fileupload', FS.readFileSync(filepath), req.body.filename + ".zip");

//     proxyReq.setHeader('content-type', `multipart/form-data; boundary=${formData.getBoundary()}`);
//     proxyReq.setHeader('content-length', formData.getBuffer().length);

//     const body = formData.getBuffer().toString("utf-8");
//     await proxyReq.write(body);

//     proxyReq.end();
// }

function getFilePath(filename, username) {
    const defpath = Path.join(CONST.DATA.DEFAULT, filename);
    const userpath = Path.join(CONST.DATA.USER, username, filename);

    if (FS.existsSync(userpath)) return userpath;
    return defpath;
}


export default route;


// [1] https://github.com/chimurai/http-proxy-middleware/blob/master/recipes/modify-post.md
import CONST from "../constants.js";
import express from "express";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import FormData from "form-data";
import Path from "path";
import FS from "fs";
import { fsjson } from "@thaerious/utility";

const route = express.Router();

const routesToForward = [
    CONST.API.GET_JOB_RECORD,
    CONST.API.DELETE_JOB,
    CONST.API.SET_VALUE,
    CONST.API.RETRIEVE_RESULTS,
]

const serverList = fsjson.load(CONST.filenames.SERVER_LIST);

for (const serverName in serverList) {
    for (const path of routesToForward) {
        const url = `/${serverName}${path}`;
        route.use(
            url,
            bodyParser.json(),
            createProxyMiddleware({
                target: serverList[serverName] + path,
                changeOrigin: true,
                onProxyReq: appendUserID
            })
        );
    }
}

async function appendUserID(proxyReq, req) {
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

function getFilePath(filename, username) {
    const defpath = Path.join(CONST.DATA.DEFAULT, filename);
    const userpath = Path.join(CONST.DATA_DIR.USERS, username, filename);

    if (FS.existsSync(userpath)) return userpath;
    return defpath;
}


export default route;


// [1] https://github.com/chimurai/http-proxy-middleware/blob/master/recipes/modify-post.md
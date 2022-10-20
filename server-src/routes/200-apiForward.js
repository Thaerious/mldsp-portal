import { API_CONST } from "mldsp-api";
import CONST from "../constants.js";
import express from "express";
import bodyParser from "body-parser";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

const route = express.Router();

const proxyOptions = {
    target: CONST.LOC.API,
    changeOrigin: true,
    onProxyReq: appendUserID
};

for (const url in API_CONST.URL) {
    route.use(
        API_CONST.URL[url],
        bodyParser.json(),
        bodyParser.urlencoded({ extended: false }),
        createProxyMiddleware(proxyOptions)
    );
}

class BodyAppender {
    constructor(source) {
        this.source = source;
    }
}

function appendUserID(proxyReq, req, res) {
    const args = {
        ...req.body,
        userid: req.oidc.user.email
    }

    const body = uriEncode(args)

    // Update header
    proxyReq.setHeader('content-type', 'application/x-www-form-urlencoded');
    proxyReq.setHeader('content-length', body.length);

    // Write out body changes to the proxyReq stream
    proxyReq.write(body);
    proxyReq.end();
}

function uriEncode(obj) {
    return Object.keys(obj)
        .map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
        })
        .join('&');
}

export default route;


// [1] https://github.com/chimurai/http-proxy-middleware/blob/master/recipes/modify-post.md
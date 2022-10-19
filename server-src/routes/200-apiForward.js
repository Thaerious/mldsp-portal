import { API_CONST } from "mldsp-api";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const route = express.Router();

for (const url in API_CONST.URL) {
    route.use(
        API_CONST.URL[url],
        createProxyMiddleware({ target: 'http://127.0.0.1:7632', changeOrigin: true })
    );    
}

export default route;
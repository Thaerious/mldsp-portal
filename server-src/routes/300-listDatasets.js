import express from "express";
import CONST from "../constants.js";
import FS from "fs";
import pkg from "express-openid-connect";
import { mkdirif } from "@thaerious/utility";
import { routeFactory } from "mldsp-api";
import getDataFiles from "../getDataFiles.js";

const { requiresAuth } = pkg;
const route = express.Router();

route.use(CONST.URL.LIST_DATASETS,
    requiresAuth(),
    routeFactory(CONST.URL.LIST_DATASETS, listDatasets)
);

async function listDatasets(req) {
    const path = mkdirif(CONST.DATA.USER, req.oidc.user.email);    
    const files = [...getDataFiles(path), ...getDataFiles(CONST.DATA.DEFAULT)];
    return { files: files };
}

export default route;
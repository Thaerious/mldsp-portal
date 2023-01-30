import express from "express";
import CONST from "../constants.js";
import pkg from "express-openid-connect";
import { mkdirif } from "@thaerious/utility";
import { routeFactory } from "../makeRoute.js";
import getDataFiles from "../getDataFiles.js";

const { requiresAuth } = pkg;
const route = express.Router();

route.use(CONST.URLS.LIST_DATASETS,
    requiresAuth(),
    routeFactory(CONST.URLS.LIST_DATASETS, listDatasets)
);

async function listDatasets(req) {
    const path = mkdirif(CONST.DATA.USER, req.oidc.user.email);
    mkdirif(CONST.DATA.DEFAULT, "/");

    return {
        user: getDataFiles(path),
        default: getDataFiles(CONST.DATA.DEFAULT)
    };
}

export default route;
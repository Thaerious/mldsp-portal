import express from "express";
import CONST from "../constants.js";
import FS from "fs";
import pkg from "express-openid-connect";
import { routeFactory, getArg } from "mldsp-api";
import { datasetPath } from "./300.uploadDatasets.js";
import bodyParser from "body-parser";

const { requiresAuth } = pkg;
const route = express.Router();

route.use(CONST.URL.REMOVE_DATASET,
    bodyParser.json(),
    requiresAuth(),
    routeFactory(CONST.URL.REMOVE_DATASET, removeDataset)
);

function removeDataset(req) {
    let filename = getArg("filename", req);
    if (!filename.endsWith(".zip")) filename += ".zip";
    const path = datasetPath(req.oidc.user.email, filename);
    if (!FS.existsSync(path)) throw new Error(`file not owned: ${filename}`);
    FS.rmSync(path);
}

export default route;
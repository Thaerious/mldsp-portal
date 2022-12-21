import express from "express";
import CONST from "../constants.js";
import FS from "fs";
import pkg from "express-openid-connect";
import { routeFactory } from "../makeRoute.js";
import { datasetPath } from "./300.api.uploadDatasets.js";
import bodyParser from "body-parser";

const { requiresAuth } = pkg;
const route = express.Router();

route.use(CONST.URLS.REMOVE_DATASET,
    bodyParser.json(),
    requiresAuth(),
    routeFactory(CONST.URLS.REMOVE_DATASET, removeDataset)
);

function removeDataset(req) {
    let filename = req.body.filename;
    if (!filename.endsWith(".zip")) filename += ".zip";
    const path = datasetPath(req.oidc.user.email, filename);
    if (!FS.existsSync(path)) throw new Error(`file not owned: ${filename}`);
    FS.rmSync(path);
}

export default route;
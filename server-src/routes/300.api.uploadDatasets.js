import express from "express";
import CONST from "../constants.js";
import FS from "fs";
import pkg from "express-openid-connect";
import { mkdirif } from "@thaerious/utility";
import { routeFactory } from "../makeRoute.js";
import fileUpload from "express-fileupload";
import Path from "path";

const { requiresAuth } = pkg;
const route = express.Router();

route.use(CONST.URLS.UPLOAD_ZIP_DATA,
    requiresAuth(),
    fileUpload({ createParentPath: true }),
    routeFactory(CONST.URLS.UPLOAD_ZIP_DATA, saveDataset)
);

function saveDataset(req) {
    if (!req.files) throw new Error("file not found");
    const file = req.files.file;

    const savePath = mkdirif(datasetPath(req.oidc.user.email, file.name));
    if (FS.existsSync(savePath)) {
        throw new Error(`Dataset already exists: ${file.name}`);
    }
    FS.writeFileSync(savePath, file.data);
}

function datasetPath(userid, filename) {
    return Path.join(CONST.DATA_DIR.USERS, userid, filename);
}

export {route as default, datasetPath}
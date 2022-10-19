import express from "express";
import CONST from "../constants.js";
import FS from "fs";
import pkg from "express-openid-connect";
import { mkdirif } from "@thaerious/utility";
import { routeFactory } from "mldsp-api";
import fileUpload from "express-fileupload";
import Path from "path";

const { requiresAuth } = pkg;
const route = express.Router();

route.use(CONST.URL.UPLOAD_ZIP_DATA,
    requiresAuth(),
    fileUpload({ createParentPath: true }),
    routeFactory(CONST.URL.UPLOAD_ZIP_DATA, saveDataset)
);

function saveDataset(req) {
    if (!req.files) throw new Error("file not found");
    const file = req.files.file;

    const savePath = mkdirif(CONST.DATA.USER, req.oidc.user.email, file.name);
    FS.writeFileSync(savePath, file.data);
}

export default route;
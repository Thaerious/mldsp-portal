import express from "express";
import fileUpload from "express-fileupload";
import FS from "fs";
import User from "../api/User.js";
import Path from "path";

const uploadRoute = express.Router();

uploadRoute.use(fileUpload({ createParentPath: true }));

uploadRoute.post("/upload-dataset", (req, res, next) => {
    if (!req.files) {
        res.send({
            status: false,
            message: "No file uploaded",
        });
        return;
    }

    saveZipFile(req);
    res.end();
});

function saveZipFile(req) {
    const file = req.files.file;
    const user = new User(req.oidc.user.email);
    const path = Path.join(user.rootPath(), file.name);
    FS.writeFileSync(path, file.data);
}

export default uploadRoute;

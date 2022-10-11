import Express from "express";
import FS from "fs";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import config from "../api/config.js";
import User from "../api/User.js";
import getJobs from "../api/getJobs.js";
import { getResults } from "../api/getResults.js";
import listDatasets from "../api/listDatasets.js";
import { default as submitRoute } from "../api/SubmitCalculation.js";
import { removeResult } from "../api/removeResult.js";
import addDataset from "../api/addDataset.js";
import pkg from "express-openid-connect";

const { requiresAuth } = pkg;
const apiRouter = Express.Router();

if (!FS.existsSync(config.data.DEFAULT)) {
    FS.mkdirSync(config.data.DEFAULT, { recursive: true });
}

apiRouter.use(bodyParser.json());

apiRouter.use(config.loc.GET_JOBS, requiresAuth(), getJobs);
apiRouter.use(config.loc.GET_RESULTS, requiresAuth(), getResults);
apiRouter.use(config.loc.LIST_DATASETS, requiresAuth(), listDatasets);
apiRouter.use(config.loc.SUBMIT_CALCULATION, requiresAuth(), submitRoute);
apiRouter.use(config.loc.REMOVE_RESULT, requiresAuth(), removeResult);

apiRouter.use(config.loc.UPLOAD_DATASET, fileUpload({
    limits: { fileSize: config.api.MAX_FILE_SIZE },
}));

apiRouter.use(config.loc.UPLOAD_DATASET, requiresAuth(), async function removeResult(req, res, next) {
    try {
        await addDataset(req.oidc.user.email, req.files.file.name, req.files.file.data);
        res.write(JSON.stringify({
            "state": "success",
            "message": "dataset uploaded successfully"
        }));        
    } catch (error) {
        res.write(JSON.stringify({
            "state": "error",
            "message": error.message
        }));
    }
    res.end();
});

export { apiRouter as default, config, User };
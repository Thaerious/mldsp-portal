import config from "./config.js";
import FS from "fs";
import User from "./User.js";

/**
 * Middleware function.
 * Wraps 'seekdir' results in json.
 */
async function listDatasets(req, res, next) {
    try {
        const user = new User(req.oidc.user.email).mkDir();
        res.json({
            route: config.loc.LIST_DATASETS,
            userid: req.oidc.user.email,
            status: config.status.OK,
            default: seekDir(config.api.PRESET_DATASET_DIR),
            user: seekDir(user.datasetPath()),
        });
        res.status(200);
    } catch (error) {
        res.json({ 
            route: config.loc.LIST_DATASETS,
            userid: req.oidc.user.email,         
            status: config.status.ERROR,   
            error: error.toString() 
        });
        res.status(500);
    } finally {
        res.end();
    }
}

/**
 * Return a list of all available datasets in the provided 'dir'.
 * Any nested directory with a "metadata.csv" file is considered a dataset.
 */
function seekDir(dir) {
    const datasets = [];

    if (FS.existsSync(dir)) {
        const contents = FS.readdirSync(dir, { withFileTypes: true });
        for (const dirEntry of contents) {
            if (dirEntry.isDirectory()) {
                datasets.push(dirEntry.name);
            }
        }
    } else {
        throw new Error(`Missing Data Directory: ${dir}`);
    }

    return datasets;
}

export { listDatasets as default, seekDir };

import FS from "fs";
import Path from "path";
import CONST from "./constants.js";

/**
 * Retrieve all .info filenames from the
 * root directory and all subdirectories.
 */
function getInfoFiles(root, result = []) {
    processDirectory(root, result);
    return result;
}

function processDirectory(path, result) {
    const contents = FS.readdirSync(path, { withFileTypes: true });
    for (const dirEntry of contents) {
        if (dirEntry.name == CONST.DATA.RECORD_FILENAME){
             result.push(Path.join(path, dirEntry.name));
        } else if (dirEntry.isDirectory()) {
            processDirectory(Path.join(path, dirEntry.name), result);
        }
    }
}

export default getInfoFiles;

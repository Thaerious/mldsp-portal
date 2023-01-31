import FS from "fs";
import Path from "path";

/**
 * Get the names (not extension) of all available .zip input files.
 */
function getDataFiles(dir) {
    const datasets = [];
    if (FS.existsSync(dir)) {
        for (const entry of FS.readdirSync(dir, { withFileTypes: true })){            
            datasets.push(Path.parse(entry.name).name);
        }
    }
    return datasets;
}

export default getDataFiles;

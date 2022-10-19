import FS from "fs";
import Path from "path";

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

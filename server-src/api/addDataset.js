import mkdirIf from "./mkdirIf.js";
import FS, { rmSync } from "fs";
import Path from "path";
import User from "./User.js";
import unzipper from "unzipper";

/**
 * Add the dataset with the zip file named 'name' and data for user 'userid'.
 * The first directory found within the zip (root inclusive) that contains both
 * a "metadata.csv" file a "fastas" directory will be used as the dataset.
 * The name of the dataset will the 'name' with any extensions removed.
 * @param {string} userid
 * @param {string} name
 * @param {Buffer} data
 */
function addDataset(userid, name, data) {
    return new Promise((resolve, reject) => {
        // save the zip file to a a temp directory
        const user = new User(userid);
        const zipPath = mkdirIf(user.rootPath(), "temp", name);
        const outPath = mkdirIf(user.rootPath(), "temp", Path.parse(name).name);
        FS.writeFileSync(zipPath, data);

        // unzip the saved file to the final destination
        FS.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: outPath }))
            .on("close", () => {
                const srcPath = seekDataset(outPath);
                if (!srcPath) throw new Error("Dataset not found in zip file.");
                const destPath = user.datasetPath(Path.parse(name).name);
                if (FS.existsSync(destPath)) {
                    rmSync(Path.join(user.rootPath(), "temp"), { recursive: true });
                    reject(new Error(`Dataset ${Path.parse(name).name} exists`));
                } else {
                    copyFile(srcPath, destPath);
                    rmSync(Path.join(user.rootPath(), "temp"), { recursive: true });
                    resolve();                    
                }
            });
    });
}

/**
 * Copy src dir to dest dir, throws error if dest exists.
 */
function copyFile(src, dest) {
    console.log(dest, FS.existsSync(dest));
    if (FS.existsSync(dest)) return false;
    FS.cpSync(src, dest, { recursive: true });
    return true;
}

/**
 * Recrusivly search path for the first directory that has both a "metadata.csv" file
 * and a "fastas" directory.  Does not handle virtual links.
 * @return the path to the dataset, or undefined
 */
function seekDataset(root) {
    const metadataPath = Path.join(root, "metadata.csv");
    const fastasPath = Path.join(root, "fastas");

    if (FS.existsSync(metadataPath) && FS.existsSync(fastasPath)) return root;
    const contents = FS.readdirSync(root, { withFileTypes: true });
    for (const dirEntry of contents) {
        if (dirEntry.isDirectory()) {
            return seekDataset(Path.join(root, dirEntry.name));
        }
    }

    return undefined;
}

export default addDataset;

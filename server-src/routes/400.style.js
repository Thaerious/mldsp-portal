import Express from "express";
import Path from "path";
import sass from "sass";
import FS from "fs";
import { mkdirif } from "@thaerious/utility";
import logger from "../setupLogger.js";

const router = Express.Router();
const SCSS_SRC = process.env.SCSS_SRC || "www/views";
const CSS_COMPILED_DIR = process.env.CSS_COMPILED_DIR || "www/compiled";
const NODE_MODULES = process.env.NODE_MODULES || "node_modules";
const STYLE_EXT = process.env.STYLE_EXT || ".scss";

/**
 * Render scss files on demand.
 * If the .scss file is older than the .css file, it will get rendered.
 * The SCSS_SRC directory is searched for a path matching the url.
 * The resulting .css file will be placed in the CSS_COMPILED_DIR.
 * Include files can be placed in the SCSS_SRC or NODE_MODULES directories.
 * This middleware will create the destination directory if it doesn't exist.
 */
router.use("*.css", (req, res, next) => {
    logger.verbose(`Render Stylesheet`);
    logger.verbose(`  \\_ URL ${req.originalUrl}`);

    const destParsed = Path.parse(req.originalUrl);
    const srcFullPath = Path.join(SCSS_SRC, destParsed.dir, destParsed.name + STYLE_EXT);
    const destFullPath = Path.join(CSS_COMPILED_DIR, req.originalUrl)

    // Terminate if there is no matching .scss file.
    if (!FS.existsSync(srcFullPath)) {
        logger.verbose(`  \\_ no source: ${srcFullPath}`);
        return next();
    }

    // Terminate if the .css file is newer than the .scss file.
    if (FS.existsSync(destFullPath)) {
        const srcStat = FS.statSync(srcFullPath);
        const destStat = FS.statSync(destFullPath);        
        if (srcStat.mtime < destStat.mtime) {
            logger.verbose(`  \\_ destination file newer: ${srcFullPath}`);
            return next();
        }
    }

    logger.verbose(`  \\_ source ${srcFullPath}`);
    logger.verbose(`  \\_ generating: ${destFullPath}`);
    compileSASS(srcFullPath, destFullPath);
    return next();
});

/**
 * Compile source .css to .scss with source map file.
 * @param {#} srcFullPath full path of .css source file
 * @param {*} destFullPath full path of .scss source file
 */
function compileSASS(srcFullPath, destFullPath) {
    const sassOptions = {
        loadPaths: [
            Path.resolve(SCSS_SRC),
            Path.resolve(NODE_MODULES),
        ],
        sourceMap: true
    };

    const result = sass.compile(srcFullPath, sassOptions);

    if (result) {
        mkdirif(destFullPath);
        FS.writeFileSync(destFullPath, result.css);
        FS.writeFileSync(destFullPath + ".map", JSON.stringify(result.sourceMap));
    }
}

export default router;
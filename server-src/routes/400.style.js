import Express from "express";
import Path from "path";
import sass from "sass";
import FS from "fs";
import { mkdirif, seekfiles } from "@thaerious/utility";
import logger from "../setupLogger.js";

const router = Express.Router();

const SRC_DIR = "www/views";
const COMPILED_DIR = "www/compiled";

// Compile scss files on demand.
router.use("*.css", (req, res, next) => {
    logger.verbose(`Compile Stylesheet`);
    logger.verbose(`  \\_ URL ${req.originalUrl}`);

    const destFilename = req.originalUrl;
    const destParsed = Path.parse(destFilename);
    const srcFilename = Path.join(SRC_DIR, destParsed.dir, destParsed.name + ".scss");
    const finalDestination = Path.join(COMPILED_DIR, destFilename)

    if (!FS.existsSync(srcFilename)) {
        logger.verbose(`  \\_ no source: ${srcFilename}`);
        return next();
    }

    if (FS.existsSync(finalDestination)) {
        const destStat = FS.statSync(finalDestination);
        const srcStat = FS.statSync(srcFilename);
        if (srcStat.mtime < destStat.mtime) {
            logger.verbose(`  \\_ destination file newer: ${srcFilename}`);
            return next();
        }
    }

    logger.verbose(`  \\_ source ${srcFilename}`);
    logger.verbose(`  \\_ generating: ${finalDestination}`);
    compileSASS(srcFilename, finalDestination);
    return next();
});

function compileSASS(srcFilename, destFilename) {
    const sassOptions = {
        loadPaths: [
            Path.resolve("www/views"),
            Path.resolve("node_modules"),
        ],
        sourceMap: true
    };

    const result = sass.compile(srcFilename, sassOptions);

    if (result) {
        const destPath = mkdirif(destFilename);
        FS.writeFileSync(destFilename, result.css);
        FS.writeFileSync(destFilename + ".map", JSON.stringify(result.sourceMap));
    }
}

export default router;
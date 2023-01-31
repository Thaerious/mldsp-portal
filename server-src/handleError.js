import CONST from "./constants.js";
import logger from "./setupLogger.js";

function handleError(err, url, req, res) {
    res.set('Content-Type', 'application/json');
    const hash = req.mldsp?.hash ?? "";
    const msg = JSON.stringify({
        status: CONST.STATUS.ERROR,
        url: url,
        message: err.message
    }, null, 2);

    logger.veryverbose(msg);
    res.write(msg);
    res.end();
}

export default handleError;
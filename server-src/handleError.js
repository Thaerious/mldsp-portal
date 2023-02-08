import CONST from "./constants.js";
import logger from "./setupLogger.js";

function handleError(res, url, err, obj = {}) {
    res.set('Content-Type', 'application/json');
    const msg = JSON.stringify({
        status: CONST.STATUS.ERROR,
        url: url,
        message: err.message,
        ...obj
    }, null, 2);

    logger.veryverbose(msg);
    res.write(msg);
    res.end();
}

export default handleError;
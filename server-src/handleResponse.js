import CONST from "./constants.js";
import logger from "./setupLogger.js";

function handleResponse(res, route, obj = {}) {
    res.set('Content-Type', 'application/json');

    const msg = JSON.stringify({
        status: CONST.STATUS.OK,
        route: route,
        ...obj
    }, null, 2);

    logger.veryverbose(msg);
    res.write(msg);
    res.end();
}

export default handleResponse;
import CONST from "./constants.js";

function handleError(err, url, req, res) {
    res.set('Content-Type', 'application/json');
    const hash = req.mldsp?.hash ?? "";
    const msg = JSON.stringify({
        status: CONST.STATUS.ERROR,
        url: url,
        message: err.message
    }, null, 2);
    res.write(msg);
}

export default handleError;
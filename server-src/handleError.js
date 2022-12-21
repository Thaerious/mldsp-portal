import {API_CONST} from "mldsp-api";

function handleError(err, url, req, res) {
    res.set('Content-Type', 'application/json');
    const hash = req.mldsp?.hash ?? "";
    const msg = JSON.stringify({
        status: API_CONST.STATUS.ERROR,
        url: url,
        message: err.message
    }, null, 2);
    res.write(msg);
}

export default handleError;
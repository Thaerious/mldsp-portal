import {API_CONST} from "mldsp-api";

function handleResponse(res, route, obj = {}) {
    res.set('Content-Type', 'application/json');

    const msg = JSON.stringify({
        status: API_CONST.STATUS.OK,
        route: route,
        ...obj
    }, null, 2);

    res.write(msg);
    res.end();
}

export default handleResponse;
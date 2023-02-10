import logger from "./setupLogger.js";

async function postapi(url, data) {
    const formData = new FormData();

    for (const field in data) {
        if (typeof (data[field]) == "object") {
            formData.set(field, data[field].blob, data[field].filename);
        } else {
            formData.set(field, data[field]);
        }
    }

    logger.verbose(`fetching ${url}`);
    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const jsonResponse = await response.json();
    logger.veryverbose(`${url} ${JSON.stringify(jsonResponse, null, 2)}`);
    return jsonResponse;
}

export default postapi;
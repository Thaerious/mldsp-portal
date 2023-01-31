import logger from "./setupLogger.js";

async function postapi(url, data) {
    const formData = new FormData();

    for (const field in data) {
        if (typeof (data[field] == "string")){
            formData.set(field, data[field]);
        } else {
            formData.set(field, field.blob, field.filename);
        }
    }

    logger.verbose(`fetching ${url}`);
    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const jsonResponse = await response.json()
    logger.veryverbose(JSON.stringify(jsonResponse, null, 2));
    return jsonResponse;
}

export default postapi;
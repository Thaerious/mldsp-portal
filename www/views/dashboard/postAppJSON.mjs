import ModalConfirm from "/dashboard/scripts/ModalConfirm.mjs";
import CONST from "/shared/constants.js";

async function postAppJSON(url, data = {}) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    const r = await response.json();
    if (r.message || r.status === CONST.STATUS.ERROR) ModalConfirm.show(r.message);
    return r;
}

export default postAppJSON;
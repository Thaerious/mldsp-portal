import ModalConfirm from "/dashboard/scripts/ModalConfirm.mjs";

async function postAppJSON(url, data = {}) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    const r = await response.json();
    if (r.message) ModalConfirm.show(r.message);
    return r;
}

export default postAppJSON;
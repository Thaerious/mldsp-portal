import CONST from "/shared/constants.js";
import ModalConfirm from "../scripts/ModalConfirm.mjs";

function showUploadDialog(selector = "#upload-form") {
    const form = document.querySelector(selector);
    const dialog = form.querySelector("[type='file']");

    form.addEventListener("submit", e => e.preventDefault(), { once: true });
    dialog.addEventListener("change", formSubmit, { once: true });
    dialog.click();

    async function formSubmit() {
        const formData = new FormData();
        formData.append("file", dialog.files[0]);

        const response = await fetch(CONST.URLS.UPLOAD_ZIP_DATA, {
            method: "POST",
            enctype: "multipart/form-data",
            body: formData
        });

        const r = await response.json();
        if (r.message || r.status === CONST.STATUS.ERROR) ModalConfirm.show(r.message);      
    }
}

export default showUploadDialog;

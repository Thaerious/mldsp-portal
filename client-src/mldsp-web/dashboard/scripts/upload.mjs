import apiConfig from "./apiConfig.mjs";
import ModalConfirm from "./ModalConfirm.mjs";

/**
 * 
 * @param {*} selector 
 */
function showUploadDialog(selector = "#upload-form") {
    const form = document.querySelector(selector);
    const dialog = form.querySelector("[type='file']");

    form.addEventListener("submit", e => e.preventDefault(), { once: true });
    dialog.addEventListener("change", formSubmit, { once: true });
    dialog.click();

    async function formSubmit() {
        const formData = new FormData();
        formData.append("file", dialog.files[0]);

        const response = await fetch(apiConfig.loc.UPLOAD_DATASET, {
            method: "POST",
            enctype: "multipart/form-data",
            body: formData
        });

        const json = await response.json();
        console.log(json.state);
        switch (json.state) {
            case "success":
                break;
            case "error":
                ModalConfirm.show(json.message);
                break;
        }
    }
}

export default showUploadDialog;

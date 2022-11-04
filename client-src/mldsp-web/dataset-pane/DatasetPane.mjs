import WidgetElement from "@html-widget/core";
import CONST from "../shared/constants.js";
import ModalConfirm from "../dashboard/scripts/ModalConfirm.mjs";

class DatasetPane extends WidgetElement {

    constructor() {
        super("dataset-pane-template");
    }

    async ready() {
        await this.getDataSetNames();
        this.loadOptions();
        this.updateButtons();

        this.dom.datasetList.addEventListener("change", event => {
            this.updateButtons();
        });

        this.dom.removeButton.addEventListener("click", async () => await this.removeDataset());
        this.dom.uploadButton.addEventListener("click", async () => this.uploadDataset());
        this.dom.startButton.addEventListener("click", async () => this.submitJob());
    }

    updateButtons() {
        const value = this.dom.datasetList.value;
        const option = this.querySelector(`option[value='${value}']`);
        const source = option.getAttribute("data-source");

        if (source == "user") {
            this.dom.removeButton.removeAttribute("disabled");
        } else {
            this.dom.removeButton.setAttribute("disabled", true);
        }
    }

    uploadDataset() {
        const dialog = this.dom.uploadForm.querySelector("[type='file']");

        this.dom.uploadForm.addEventListener("submit", e => e.preventDefault(), { once: true });
        dialog.value = null;
        dialog.addEventListener("change", async () => await formSubmit(this), { once: true });
        dialog.click();

        async function formSubmit(page) {
            const formData = new FormData();
            formData.append("file", dialog.files[0]);

            const response = await fetch(CONST.URL.UPLOAD_ZIP_DATA, {
                method: "POST",
                enctype: "multipart/form-data",
                body: formData
            });

            await page.getDataSetNames();
            page.loadOptions();
            page.updateButtons();

            const r = await response.json();
            if (r.message) ModalConfirm.show(r.message);
        }
    }

    async removeDataset() {
        const response = await fetch(CONST.URL.REMOVE_DATASET, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                filename: this.dom.datasetList.value,
            }),
        });

        const r = await response.json();
        console.log(r);
        if (r.message) ModalConfirm.show(r.message);

        await this.getDataSetNames();
        this.loadOptions();
        this.updateButtons();

        return r;
    }

    async getDataSetNames() {
        const response = await fetch(CONST.URL.LIST_DATASETS, {
            method: "POST",
        });
        const r = await response.json();
        this.datasetNames = {
            default: r.default,
            user: r.user
        }
        return this.datasetNames;
    }

    async submitJob() {
        const jobid = (await postAPPJ(CONST.URL.CREATE_JOB)).jobid;
        await postMPFD(CONST.URL.UPLOAD_DATA, { filename: this.dom.datasetList.value });
    }

    /**
    * Create <option> element from names, inserting into <select> element 'container'.
    * @param {Array} names
    * @param {string} container
    */
    loadOptions() {
        this.dom.datasetList.replaceChildren();

        for (const listname of Object.keys(this.datasetNames)) {
            for (const name of this.datasetNames[listname]) {
                const element = document.createElement("option");
                element.setAttribute("value", name);
                element.setAttribute("data-source", listname);
                element.innerHTML = name + ` (${listname})`;
                this.dom.datasetList.append(element);
            }
        }
    }
}

async function postAPPJ(url, data = {}) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function postMPFD(url, data = {}) {
    const formData = new FormData();

    for (const name in data) {
        console.log(name + " " + data[name]);
        formData.append(name, data[name]);
    }
    console.log(formData);
    const response = await fetch(url, {
        method: "POST",
        body: formData
    });
    return await response.json();
}

window.customElements.define('dataset-pane', DatasetPane);
export default DatasetPane;

// [1] https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/
import CONST from "/shared/constants.js";
import ModalConfirm from "/dashboard/scripts/ModalConfirm.mjs";
import { convertToCamel } from "../../scripts/namingConventions.mjs";
import postAppJSON from "../../postAppJSON.mjs";

class DataPane extends HTMLElement {

    /**
     connectedCallback is invoked each time the custom element is appended into a document-connected element
     */
    async connectedCallback() {
        this.detectDOM();
        window.addEventListener(
            "load",
            async () => await this.ready(), { once: true }
        );
    }

    detectDOM() {
        this.dom = {};
        for (const element of this.querySelectorAll("[id]")) {
            this.dom[convertToCamel(element.id)] = element;
        }
        return this.dom;
    }

    async ready() {
        this.refresh();
        this.dom.datasetList.addEventListener("change", event => this.updateButtons());
        this.dom.removeButton.addEventListener("click", async () => await this.removeDataset());
        this.dom.uploadButton.addEventListener("click", () => this.uploadDataset());
        this.dom.startButton.addEventListener("click", async () => await this.submitJob());
    }

    async refresh() {
        this.updateSelector(await this.getDataSetNames());
        this.updateButtons();
    }

    updateButtons() {
        const selected = this.selectedDataSet();

        if (!selected) {
            this.dom.removeButton.setAttribute("disabled", true);
            this.dom.startButton.setAttribute("disabled", true);
        }
        else if (selected.source == "user") {
            this.dom.removeButton.removeAttribute("disabled");
            this.dom.startButton.removeAttribute("disabled");
        }
        else {
            this.dom.removeButton.setAttribute("disabled", true);
            this.dom.startButton.removeAttribute("disabled");
        }
    }

    selectedDataSet() {
        const index = this.dom.datasetList.selectedIndex;
        if (index == -1) return null;
        const element = this.dom.datasetList.childNodes[index];

        return {
            name: element.getAttribute("value"),
            source: element.getAttribute("data-source")
        }
    }

    uploadDataset() {
        const dialog = this.dom.uploadForm.querySelector("[type='file']");

        this.dom.uploadForm.addEventListener("submit", e => e.preventDefault(), { once: true });
        dialog.value = null; // needed so dialog triggers if the same value is selected twice

        dialog.addEventListener("change", async () => {
            const formData = new FormData();
            formData.append("file", dialog.files[0]);

            const response = await fetch(CONST.URLS.UPLOAD_ZIP_DATA, {
                method: "POST",
                enctype: "multipart/form-data",
                body: formData
            });

            const r = await response.json();
            if (r.message) ModalConfirm.show(r.message);
            else this.refresh();
        }, { once: true });

        dialog.click();
    }

    async removeDataset() {
        const r = await postAppJSON(
            CONST.URLS.REMOVE_DATASET,
            { filename: this.dom.datasetList.value }
        );

        if (r.message) ModalConfirm.show(r.message);
        this.refresh();
    }

    async getDataSetNames() {
        const response = await fetch(CONST.URLS.LIST_DATASETS, {
            method: "POST",
        });
        const r = await response.json();
        if (r.message) ModalConfirm.show(r.message);

        const datasetNames = {
            default: r.default,
            user: r.user
        }
        return datasetNames;
    }

    async submitJob() {
        const index = this.dom.datasetList.selectedIndex;
        const optionElement = this.dom.datasetList.childNodes[index];

        const r = await postAppJSON(
            CONST.URLS.SUBMIT_JOB, {
            filename: this.dom.datasetList.value,
            source: optionElement.getAttribute("data-source"),
            description: document.querySelector("#analysisName").value
        }
        );
        document.querySelector("job-pane").refresh();
    }

    /**
    * Create <option> element from names, inserting into <select> element 'container'.
    * @param {Object} names {user, default}
    * @param {string} container
    */
    updateSelector(names) {
        this.dom.datasetList.replaceChildren();

        for (const listname of ["default", "user"]) {
            for (const name of names[listname]) {
                const element = document.createElement("option");
                element.setAttribute("value", name);
                element.setAttribute("data-source", listname);
                element.innerHTML = name + ` (${listname})`;
                this.dom.datasetList.append(element);
            }
        }
    }
}

window.customElements.define('data-pane', DataPane);
export default DataPane;

// [1] https://muffinman.io/blog/uploading-files-using-fetch-multipart-form-data/
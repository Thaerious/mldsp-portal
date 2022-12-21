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
        window.addEventListener("load", async () => await this.ready(), { once: true });
    }

    detectDOM() {
        this.dom = {};
        for (const element of this.querySelectorAll("[id]")) {
            this.dom[convertToCamel(element.id)] = element;
        }
        return this.dom;
    }

    async ready() {
        const datasetnames = await this.getDataSetNames()
        this.loadOptions(datasetnames);
        this.updateButtons();

        this.dom.datasetList.addEventListener("change", event => {
            this.updateButtons();
        });

        this.dom.removeButton.addEventListener("click", async () => await this.removeDataset());
        this.dom.uploadButton.addEventListener("click", () => this.uploadDataset());
        this.dom.startButton.addEventListener("click", async () => await this.submitJob());
    }

    updateButtons() {
        const value = this.dom.datasetList.value;

        if (!value) {
            this.dom.removeButton.setAttribute("disabled", true);
            this.dom.startButton.setAttribute("disabled", true);
            return;
        }

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

            const response = await fetch(CONST.URLS.UPLOAD_ZIP_DATA, {
                method: "POST",
                enctype: "multipart/form-data",
                body: formData
            });

            page.loadOptions(await this.getDataSetNames());
            page.updateButtons();

            const r = await response.json();
            if (r.message) ModalConfirm.show(r.message);
        }
    }

    async removeDataset() {
        const r = await postAppJSON(
            CONST.URLS.REMOVE_DATASET,
            { filename: this.dom.datasetList.value }
        );
   
        if (r.message) ModalConfirm.show(r.message);

        this.loadOptions(await this.getDataSetNames());
        this.updateButtons();

        return r;
    }

    async getDataSetNames() {
        const response = await fetch(CONST.URLS.LIST_DATASETS, {
            method: "POST",
        });
        const r = await response.json();
        const datasetNames = {
            default: r.default,
            user: r.user
        }
        return datasetNames;
    }

    async submitJob() {
        const index = this.dom.datasetList.selectedIndex;
        const optionElement = this.dom.datasetList.childNodes[index];        
        console.log("submit job");

        await postAppJSON(
            CONST.URLS.SUBMIT_JOB,
            {
                filename: this.dom.datasetList.value,
                source: optionElement.getAttribute("data-source")
            }
        );
        
        console.log("job submitted");
        console.log(document.querySelector("job-pane"));
        document.querySelector("job-pane").refresh();
    }

    /**
    * Create <option> element from names, inserting into <select> element 'container'.
    * @param {Object} names {user, default}
    * @param {string} container
    */
    loadOptions(names) {
        this.dom.datasetList.replaceChildren();

        for (const listname of ["default", "user"]){
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
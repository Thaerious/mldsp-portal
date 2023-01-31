import CONST from "/shared/constants.js";
import { convertToCamel } from "../../scripts/namingConventions.mjs";
import postAppJSON from "../../postAppJSON.mjs";
import ModalConfirm from "../../scripts/ModalConfirm.mjs";

class JobPane extends HTMLElement {

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

    async refresh() {
        await this.loadJobs();
        this.updateButtons();
        this.updateFields()        
    }

    async ready() {
        await this.refresh();

        this.dom.jobsList.addEventListener("change", event => {
            this.updateButtons();
            this.updateFields();
        });
        
        this.dom.viewButton.addEventListener("click", event => {
            this.showSelectedAnalytics();
        });

        this.dom.deleteButton.addEventListener("click", event => {
            this.deleteSelectedJob();
        });
    }

    showSelectedAnalytics() {
        if (!this.selectedRecord()) return;        
        const jobid = this.selectedRecord().jobid;
        const server = this.selectedRecord().server;
        window.open(`${CONST.URLS.ANALYTICS}?server=${server}&jobid=${jobid}`);
    }

    /**
     * Update the enabled/disabled status of the buttons, based on the job
     * status field.
     */
    updateButtons() {
        if (!this.selectedRecord()) {
            this.dom.viewButton.setAttribute("disabled", true);
            this.dom.deleteButton.setAttribute("disabled", true);
            return;
        }

        this.dom.deleteButton.removeAttribute("disabled");

        if (this.selectedRecord().status === CONST.STATUS.PENDING) {
            this.dom.viewButton.setAttribute("disabled", true);
        }
        else if (this.selectedRecord().status === CONST.STATUS.COMPLETE) {
            this.dom.viewButton.removeAttribute("disabled");
        }
    }

    selectedRecord() {
        const index = this.dom.jobsList.selectedIndex;
        if (index == -1) return;
        const element = this.dom.jobsList.options[index];
        const jobid = element.getAttribute("data-jobid");
        return this.jobs[jobid]
    }

    /**
     * Update the job-fields text values based on the currently selected job.
     */
    updateFields() {
        const record = this.selectedRecord();
        if (!record) {
            this.dom.jobIdValue.innerText = "";
            this.dom.descriptionValue.innerText = "";
            this.dom.statusValue.innerText = "";
            this.dom.dataFileValue.innerText = "";
        } else {
            this.dom.jobIdValue.innerText = record.jobid;
            this.dom.descriptionValue.innerText = record.desc;
            this.dom.statusValue.innerText = record.status;
            this.dom.dataFileValue.innerText = record.zipfile;
        }
    }

    /**
     * Load all jobs for this user from the api server, refilling the selector.
     */
    async loadJobs() {
        // clear previous jobs
        this.dom.jobsList.innerHTML = "";
        this.jobs = {};

        // fill selector
        try {
            const jobs = await getJobs();
            for (const job of jobs.records) {
                this.addJobItem(job);
            }            
        } catch (response) {
            console.log(response);
        }
    }

    addJobItem(record) {
        const uid = record.server + "-" + record.jobid;
        const element = document.createElement("option");
        element.setAttribute("value", record.desc);
        element.setAttribute("data-jobid", uid);
        element.innerHTML = `${record.desc} (${uid})`;
        this.dom.jobsList.append(element);
        this.jobs[uid] = record;
    }

    async deleteSelectedJob() {
        const record = this.selectedRecord();
        if (!record) return;        

        const r = await postAppJSON(
            record.server + CONST.API.DELETE_JOB,
            { "jobid": record.jobid }
        );
   
        if (r.message) ModalConfirm.show(r.message);
        await this.refresh();
    }
}

async function getJobs() {
    const response = await fetch(CONST.API.LIST_JOBS, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    });

    const r = await response.json();
    if (r.message) ModalConfirm.show(r.message);
    if (r.status == "error") throw r;
    return r;
}

window.customElements.define('job-pane', JobPane);
export default JobPane;
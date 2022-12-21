import CONST from "/shared/constants.js";
import {API_CONST} from "mldsp-api";
import { convertToCamel } from "../../scripts/namingConventions.mjs";
import postAppJSON from "../../postAppJSON.mjs";

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
        console.log("refresh");
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
        
        this.dom.deleteButton.addEventListener("click", event => {
            console.log("delete");
            this.deleteSelectedJob();
        });
    }

    /**
     * Update the enabled/disabled status of the buttons, based on the job
     * status field.
     */
    updateButtons() {
        const index = this.dom.jobsList.selectedIndex;
        if (index == -1) return;
        const element = this.dom.jobsList.options[index];
        const jobid = element.getAttribute("data-jobid");
        const record = this.jobs[jobid]

        if (record.status === API_CONST.STATUS.PENDING) {
            this.dom.viewButton.setAttribute("disabled", true);
        }
        else if (record.status === API_CONST.STATUS.COMPLETE) {
            this.dom.viewButton.setAttribute("disabled", false);
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
        if (!record) return;
        this.dom.jobIdValue.innerText = record.jobid;
        this.dom.descriptionValue.innerText = record.desc;
        this.dom.statusValue.innerText = record.status;
        this.dom.dataFileValue.innerText = record.zipfile;
    }

    /**
     * Load all jobs for this user from the api server, refilling the selector.
     */
    async loadJobs() {
        // clear previous jobs
        this.dom.jobsList.innerHTML = "";
        this.jobs = {};

        // fill selector
        const jobs = await getJobs();
        console.log(jobs);
        for (const job in jobs.records) {
            this.addJobItem(jobs.records[job]);
        }
    }

    addJobItem(record) {
        const element = document.createElement("option");
        element.setAttribute("value", record.desc);
        element.setAttribute("data-jobid", record.jobid);
        element.innerHTML = `${record.desc} (${record.jobid})`;
        this.dom.jobsList.append(element);

        this.jobs[record.jobid] = record;
    }

    async deleteSelectedJob() {
        const r = await postAppJSON(
            API_CONST.FORWARD_URLS.DELETE_JOB,
            { "jobid": this.selectedRecord().jobid }
        );
   
        if (r.message) ModalConfirm.show(r.message);
        await this.refresh();
    }
}

async function getJobs() {
    const response = await fetch(CONST.URLS.LIST_JOBS, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    });

    const r = await response.json();
    // console.log(r);
    return r;
}

window.customElements.define('job-pane', JobPane);
export default JobPane;
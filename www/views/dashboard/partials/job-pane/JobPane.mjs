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
        await this.updateSelectedRecord();
    }

    async select(servername, jobid) {
        const uid = servername + "-" + jobid;
        const element = this.querySelector(`[data-jobid='${uid}']`);
        const index = Array.from(element.parentNode.children).indexOf(element);
        this.dom.jobsList.selectedIndex = index;
        await this.updateSelectedRecord();
    }

    async ready() {
        await this.refresh();

        this.dom.jobsList.addEventListener("change", async event => {
            await this.updateSelectedRecord();
        });
        
        this.dom.viewButton.addEventListener("click", event => {
            this.showSelectedAnalytics();
        });

        this.dom.deleteButton.addEventListener("click", event => {
            this.deleteSelectedJob();
        });
    }

    // Update the currently selected record,
    // If the record status is pending or running, wait 5 seconds and update again.
    async updateSelectedRecord() {   
        if (this.recordTimeout) clearTimeout(this.recordTimeout);

        const record = await this.refreshSelectedRecord();
        this.updateButtons();
        this.updateFields();        
        if (!record) return;

        const status = record.status;
        if (CONST.REFRESH_INCREMENT <= 0) return;
        if (status == CONST.STATUS.RUNNING || status == CONST.STATUS.PENDING) {           
            this.recordTimeout = setTimeout(() => {
                this.updateSelectedRecord();
            }, CONST.REFRESH_INCREMENT);
        }
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
    updateButtons(record) {
        if (!this.selectedRecord()) {
            this.dom.viewButton.setAttribute("disabled", true);
            this.dom.deleteButton.setAttribute("disabled", true);
            return;
        }

        this.dom.deleteButton.removeAttribute("disabled");
        this.dom.viewButton.setAttribute("disabled", true);

        if (this.selectedRecord().status === CONST.STATUS.COMPLETE) {
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

        if (!this.jobs[uid]) {
            const element = document.createElement("option");
            element.setAttribute("value", record.desc);
            element.setAttribute("data-jobid", uid);
            element.innerHTML = `${record.desc} (${uid})`;
            this.dom.jobsList.append(element);
        }

        this.jobs[uid] = record;
    }

    async deleteSelectedJob() {
        const record = this.selectedRecord();
        if (!record) return;        

        const r = await postAppJSON(
            record.server + CONST.API.DELETE_JOB,
            { "jobid": record.jobid }
        );
   
        if (r.message || r.status === CONST.STATUS.ERROR) ModalConfirm.show(r.message);
        await this.refresh();
    }

    async refreshSelectedRecord() {
        const record = this.selectedRecord();
        if (!record) return;

        const r = await postAppJSON(
            record.server + CONST.API.GET_JOB_RECORD,
            { "jobid": record.jobid }
        );
    
        if (r.message || r.status === CONST.STATUS.ERROR) ModalConfirm.show(r.message);
        if (r.status == "error") throw r;
        r.record.server = record.server;

        this.addJobItem(r.record)
        return r.record;   
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
    if (r.message || r.status === CONST.STATUS.ERROR) ModalConfirm.show(r.message);
    if (r.status == "error") throw r;
    return r;
}



window.customElements.define('job-pane', JobPane);
export default JobPane;
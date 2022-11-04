import WidgetElement from "@html-widget/core";
import CONST from "/shared/constants.js";
import API_CONST from "mldsp-api";

class JobPane extends WidgetElement {

    constructor() {
        super("job-pane-template");
    }

    async ready() {
        await this.loadJobs();
        this.updateButtons();

        this.dom.jobsList.addEventListener("change", event => {
            this.updateButtons();
        });

    }

    updateButtons() {
        const index = this.dom.jobsList.selectedIndex;
        if (index == -1) return;
        const element = this.dom.jobsList.options[index];
        const jobid = element.getAttribute("data-jobid");
        const record = this.jobs[jobid]
        console.log(record);

        if (record.status === API_CONST.PENDING) {
            this.dom.viewButton.classList.add("disabled");
            this.dom.deleteButton.classList.add("disabled");
        }
        else if (record.status === API_CONST.COMPLETE) {
            this.dom.viewButton.classList.remove("disabled");
            this.dom.deleteButton.classList.remove("disabled");
        }
    }

    async loadJobs() {
        // clear previous jobs
        this.dom.jobsList.innerHTML = "";
        this.jobs = {};

        const jobs = await getJobs();
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

        // const clone = cloneTemplate("#result-item-template", "#jobs-container");
        // clone.setAttribute("data-id", result.jobid);
        // clone.querySelector(".resultname").innerHTML = `${result.jobname} ${result.dataset}`;

        // if (result.status === "pending") {
        //     clone.querySelector(".select").classList.add("disabled");
        //     clone.querySelector(".remove").classList.add("disabled");
        // }

        // clone.querySelector(".select").addEventListener("click", (event) => {
        //     window.open(`/analytics?jobid=${result.jobid}`);
        // });

        // clone.querySelector(".remove").addEventListener("click", async (event) => {
        //     await removeResult(result.jobid);
        //     await loadJobs();
        // });
    }
}

async function getJobs() {
    // console.log(CONST);
    const response = await fetch(CONST.URL.LIST_JOBS, {
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
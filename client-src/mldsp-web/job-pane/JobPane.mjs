import WidgetElement from "@html-widget/core";
import CONST from "/shared/constants.js";

class JobPane extends WidgetElement {

    constructor() {
        super("job-pane-template");
    }

    ready() {
        console.log("job pane ready");
        this.loadJobs();
    }

    async loadJobs(containerName = "#jobs-container") {
        const container = document.querySelector(containerName);
        const jobs = await getJobs();

        // clear previous jobs
        this.querySelector(containerName).innerHTML = "";

        for (const job in jobs.data) {
            addJobItem(jobs.data[job]);
        }
    }

    addJobItem(result) {
        const clone = cloneTemplate("#result-item-template", "#jobs-container");
        clone.setAttribute("data-id", result.jobid);
        clone.querySelector(".resultname").innerHTML = `${result.jobname} ${result.dataset}`;

        if (result.status === "pending") {
            clone.querySelector(".select").classList.add("disabled");
            clone.querySelector(".remove").classList.add("disabled");
        }

        clone.querySelector(".select").addEventListener("click", (event) => {
            window.open(`/analytics?jobid=${result.jobid}`);
        });

        clone.querySelector(".remove").addEventListener("click", async (event) => {
            await removeResult(result.jobid);
            await loadJobs();
        });
    }
}

async function getJobs() {
    console.log(CONST);
    const response = await fetch(CONST.URL.LIST_JOBS, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    });

    const r = await response.json();
    console.log(r);
    return r;
}

window.customElements.define('job-pane', JobPane);
export default JobPane;
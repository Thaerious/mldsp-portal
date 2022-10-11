"use strict";
import {removeResult, getJobs, getNumericalRepresentations, getDataSetNames, getCGRKValue, submitCalculation} from "./externals.mjs";
import cloneTemplate from "./cloneTemplate.mjs";
import showUploadDialog from "./upload.mjs";

(() => {
    window.addEventListener("load", async() => {
        loadOptions(await getDataSetNames(), "#datasetname");
        loadOptions(getNumericalRepresentations(), "#num_repr");
        loadOptions(getCGRKValue(), "#cgr_k_val");
        loadJobs("#jobs-container");
        document.querySelector("#upload-button").addEventListener("click", ()=>showUploadDialog());
        document.querySelector("#start-button").addEventListener("click", prepareCalculation);
    });
})();

async function prepareCalculation(){
    const selectedDataSets = getSelectedDataSet();
    const name = document.querySelector("#analysisName").value;
    const representation = document.querySelector("#num_repr").value;

    const settings = {
        representation : representation,
        kvalue: document.querySelector("#cgr_k_val").value
    }

    // placeholder job item to smooth out UI transitions
    addJobItem({
        jobid : -1,
        status : "pending",
        jobname : name,
        dataset: selectedDataSets
    });

    await submitCalculation(name, selectedDataSets, settings);
    await loadJobs("#jobs-container");
}

async function loadJobs(containerName = "#jobs-container"){
    const container = document.querySelector(containerName);
    const jobs = await getJobs();
    
    // clear previous jobs
    document.querySelector(containerName).innerHTML = "";

    for (const job in jobs.data){
        addJobItem(jobs.data[job]);
    }
}
 
function addJobItem(result) {
    const clone = cloneTemplate("#result-item-template", "#jobs-container");
    clone.setAttribute("data-id", result.jobid);
    clone.querySelector(".resultname").innerHTML = `${result.jobname} ${result.dataset}`;

    if (result.status === "pending"){
        clone.querySelector(".select").classList.add("disabled");
        clone.querySelector(".remove").classList.add("disabled");
    }

    clone.querySelector(".select").addEventListener("click", (event)=>{
        window.open(`/analytics?jobid=${result.jobid}`);
    });

    clone.querySelector(".remove").addEventListener("click", async (event)=>{
        await removeResult(result.jobid);
        await loadJobs();
    });
}
window.addJobItem = addJobItem;
/**
 * Create <option> element from names, inserting into <select> element 'container'.
 * @param {Array} names
 * @param {string} container
 */
function loadOptions(names, container) {
    const parentElement = document.querySelector(container);

    for (const name of names) {
        const element = document.createElement("option");
        element.setAttribute("value", name);
        element.innerHTML = name;
        parentElement.append(element);
    }
}

function addDataSet(name, id) {
    const clone = cloneTemplate("#selected-dataset-template", "#selected-datsets");

    clone.setAttribute("id", id);
    clone.setAttribute("data-name", name);
    clone.querySelector(".dataset-name").innerHTML = name;
    clone.querySelector(".dataset-desc").innerHTML = `ID: ${id}`;

    clone.querySelector(".remove").addEventListener("click", () => {
        clone.parentElement.removeChild(clone);
    });
}

/**
 * Retrieve the currently selected dataset.
 */
function getSelectedDataSet() {
    return document.querySelector("#datasetname").value;
}

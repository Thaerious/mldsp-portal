"use strict";

import CONST from "/shared/constants.js";
import {removeResult, getNumericalRepresentations, getCGRKValue, submitCalculation} from "./scripts/externals.mjs";
import cloneTemplate from "./scripts/cloneTemplate.mjs";
import showUploadDialog from "./scripts/upload.mjs";

import ModalConfirm from "./scripts/ModalConfirm.mjs";
window.ModalConfirm = ModalConfirm;

(() => {
    window.addEventListener("load", async() => {
        loadOptions(getNumericalRepresentations(), "#num_repr");
        loadOptions(getCGRKValue(), "#cgr_k_val");
        // document.querySelector("#upload-button").addEventListener("click", ()=>showUploadDialog());
        // document.querySelector("#start-button").addEventListener("click", prepareCalculation);
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

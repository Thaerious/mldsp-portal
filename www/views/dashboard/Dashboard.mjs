"use strict";

import CONST from "/shared/constants.js";
import {removeResult, getNumericalRepresentations, getCGRKValue, submitCalculation} from "./scripts/externals.mjs";
import cloneTemplate from "./scripts/cloneTemplate.mjs";
import showUploadDialog from "./scripts/upload.mjs";
import JobPane from "./partials/job-pane/JobPane.mjs";

import ModalConfirm from "./scripts/ModalConfirm.mjs";
window.ModalConfirm = ModalConfirm;

(() => {
    window.addEventListener("load", async() => {
        loadOptions(getNumericalRepresentations(), "#num_repr");
        loadOptions(getCGRKValue(), "#cgr_k_val");
    });
})();

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
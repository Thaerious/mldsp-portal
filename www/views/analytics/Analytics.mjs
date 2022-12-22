"use strict";
import postAppJSON from "../dashboard/postAppJSON.mjs";
import { API_CONST } from "mldsp-api";
import cloneTemplate from "./cloneTemplate.mjs";
import cMatrix from "./cMatrix.mjs";

let selectedCMatrix = "";

window.addEventListener("load", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobid = urlParams.get("jobid");

    const r = await postAppJSON(API_CONST.URLS.RETRIEVE_RESULTS, { jobid: jobid });
    window.results = r.results;
    loadView(r.results);
});

function loadView(data) {
    // (1) use plotly to display multi-dimensional scaling (mds)
    Plotly.plot("mdsgraph", JSON.parse(data.mds), {});

    // (2) convert data.cgr to an image and assign it as an image source
    const cgrSrc = "data:image/png;base64," + data.cgr;
    document.querySelector("#cgr-graph").setAttribute("src", cgrSrc);

    // (3) convolution matrices
    loadCMatrices(data.cMatrix, data.cMatrixLabels);
    document.querySelector("#cmatrix-select").addEventListener("change", cMatrixSelector);

    // (4) intercluster distances
    document.querySelector("#intercluster-table").innerHTML = data.interclusterDist;

    // (5) model accuracy
    toTable(document.querySelector("#accuracy-table"), data.modelAcc, ["Classifier", "Accuracy (%)"]);
}

// Load the convolution matrices
function loadCMatrices(cMatrices, cMatrixLabels) {
    const modelType = document.querySelector("#cmatrix-select");
    for (const key in cMatrices) {
        addOption(modelType, key);
        addMatrix(key, cMatrices[key], cMatrixLabels);
    }
}

/**
 * Used by the <select> element change listener to hide and show c-matrices.
 */
function cMatrixSelector(event) {
    const value = document.querySelector("#cmatrix-select").value;
    document.querySelector(`#cMatrix-${selectedCMatrix}`).classList.add("hidden");
    document.querySelector(`#cMatrix-${value}`).classList.remove("hidden");
    selectedCMatrix = value;
}

/** 
 * Add option 'key' to <select> element 'parent'.
 */
function addOption(parent, key) {
    const option = document.createElement("option");
    option.setAttribute("value", key);
    option.innerHTML = key;
    parent.appendChild(option);
}

/** 
 * Add a new "cmatrix-template" (see html) to 'parent'.
 * Uses cMatrix.mjs which is ported from the origional code.
 */
function addMatrix(key, value, labels, parent = "#conf-matrix-container") {
    const child = cloneTemplate("#cmatrix-template", parent);

    child.setAttribute("id", `cMatrix-${key}`);
    child.querySelector("#container-").setAttribute("id", `container-${key}`);
    child.querySelector("#legend-").setAttribute("id", `legend-${key}`);

    if (selectedCMatrix === "") {
        selectedCMatrix = key;
    } else {
        child.classList.add("hidden");
    }

    cMatrix({
        container: `#container-${key}`,
        legend: `#legend-${key}`,
        uniqueID: key,
        data: value,
        labels: labels,
        start_color: "#ffffff",
        end_color: "#0282d1",
    });
}

/**
 * Insert 'data' into 'table' using 'columnLabels' for headers.
 * Table is assumed to empty before data insertion.
 * The first column will the key values of the data object.
 * Will append a row to the table for each value in data object.
 * 
 * @param {HTMLElement} toTable the target table element.
 * @param {object} data the data object (dictionary).
 * @param {string[]} columnLabels labels to use for columns.
 */
function toTable(table, data, columnLabels) {
    console.log(data);
    const head = table.querySelector("thead > tr");
    const body = table.querySelector("tbody");

    for (const key of columnLabels) {
        const th = document.createElement("th");
        th.innerHTML = key;
        head.appendChild(th);
    }

    for (const key in data) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${key}</td>`;
        body.append(tr);

        if (typeof data[key] === "object") {
            for (const value of data[key]) {
                const td = document.createElement("td");
                td.innerHTML = value;
                tr.append(td);
            }
        }
        else if (typeof data[key] === "number") {
            const td = document.createElement("td");
            td.innerHTML = data[key];
            tr.append(td);
        }
    }
}
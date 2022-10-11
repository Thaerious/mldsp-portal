import apiConfig from "./apiConfig.mjs";

function getNumericalRepresentations() {
    return [
        "cgr",
        "num_mapping_PP",
        "num_mapping_Int",
        "num_mapping_IntN",
        "num_mapping_Real",
        "num_mapping_Doublet",
        "num_mapping_Codons",
        "num_mapping_Atomic",
        "num_mapping_EIIP",
        "num_mapping_AT_CG",
        "num_mapping_justA",
        "num_mapping_justC",
        "num_mapping_justG",
        "num_mapping_justT",
        "PuPyCGR",
        "1DPuPyCGR",
    ];
}

async function getDataSetNames() {
    const response = await fetch(apiConfig.loc.LIST_DATASETS, {
        method: "POST",
    });
    const r = await response.json();
    console.log(r);
    return [...r.default, ...r.user];
}

async function getResults(jobid){
    const response = await fetch(apiConfig.loc.GET_RESULTS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jobid: jobid,
        }),        
    });

    return await response.json();
}

async function getJobs() {
    const response = await fetch(apiConfig.loc.GET_JOBS, {
        method: "POST",
    });

    const r = await response.json();
    console.log(r);
    return r;
}

function getCGRKValue() {
    return [3, 4, 5, 6, 7, 8];
}

/**
 * Submit a MLDSP run.
 * The data set name must be either a preloaded set or one loaded by the
 * user.  The settings must contain the field "representation" (numerical representation)
 * and any other data that the particular representation requries (ie kValue for CGR).
 *
 * A returned error will also have a field "message".
 *
 * @param {string[]} dataset the name of the data set as returned by getDataSetNames.
 * @param {object} settings data to direct the run, required field 'representation'.
 * @return {object} {status = {pending, error}, uid, dataSetName}
 *
 * See: represenations.txt
 */
async function submitCalculation(name, dataset, settings) {
    const response = await fetch(apiConfig.loc.SUBMIT_CALCULATION, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jobname: name,
            dataset: dataset,
            settings: settings,
        }),
    });

    const r = await response.json();
    console.log(r);
    return r;
}

async function removeResult(jobid){
    const response = await fetch(apiConfig.loc.REMOVE_RESULT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jobid: jobid
        }),
    });

    const r = await response.json();
    console.log(r);
    return r;    
}

export { removeResult, getResults, getJobs, getNumericalRepresentations, getDataSetNames, getCGRKValue, submitCalculation };

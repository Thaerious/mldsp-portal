import MLDPS from "./api/MLDSP.js";
import {JobRecord} from "./api/Jobs.js";

const jobRecord = new JobRecord(
    "username1",
    "0",
    "jobname",
    "Primates", 
    {
        representation : "cgr", 
        kvalue : "3"
    }
);

const mldsp = new MLDPS(jobRecord);
const results = await mldsp.run();
console.log(results);
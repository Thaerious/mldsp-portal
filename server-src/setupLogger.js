import Logger from "@thaerious/logger";
import {mkdirif} from "@thaerious/utility";
import FS from "fs";
import Path from "path";
import ParseArgs from "@thaerious/parseargs"

/**
 * date : Date object
 * dateArray : Date array, specifies formatting
 * seperator : Seperator
 */
function joinDate(date, dateArray, seperator) {
    function format(m) {
       let f = new Intl.DateTimeFormat('en', m);
       return f.format(date);
    }
    return dateArray.map(format).join(seperator);
 }

function getLogFile() {
    const dateArray = [{year: 'numeric'}, {month: 'short'}, {day: 'numeric'}];
    const dateString = joinDate(new Date, dateArray, '_');
    return Path.join("log", dateString + ".txt");    
}

const options = {
    flags: [
        {
            long: `verbose`,
            short: `v`,
            type: `boolean`
        }
    ]
};

const args = new ParseArgs().loadOptions(options).run();
const appLogger = new Logger();

appLogger.channel(`standard`).enabled = true;
appLogger.channel(`error`).enabled = true;
appLogger.channel(`log`).enabled = true;
appLogger.channel(`verbose`).enabled = false;
appLogger.channel(`veryverbose`).enabled = false;

if (args.flags["verbose"]) appLogger.channel(`verbose`).enabled = true;
if (args.tally["verbose"] >= 2) appLogger.channel(`veryverbose`).enabled = true;

// appLogger.channel(`log`).log = (text) => {
//     FS.appendFileSync(getLogFile(), text + "\n");
// }

// appLogger.channel("error").log = function(string){
//     console.error("Error: see log files");
//     const path = mkdirif(process.env.LOG_DIR, "error.log");
//     FS.appendFileSync(path, "\n *** " + new Date().toString() + "\n" + string + "\n");
// }

export default appLogger.all();
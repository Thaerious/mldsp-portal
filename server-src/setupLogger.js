import Logger from "@thaerious/logger";
import CONST from "./constants.js";
import { mkdirif } from "@thaerious/utility";
import FS from "fs";
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

function logFilename() {
    const dateArray = [{ year: 'numeric' }, { month: 'short' }, { day: 'numeric' }];
    const dateString = joinDate(new Date, dateArray, '_');
    return mkdirif(CONST.PATH.LOG, dateString + ".txt");
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
const logger = new Logger();

logger.channel(`standard`).enabled = true;
logger.channel(`error`).enabled = true;
logger.channel(`log`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`veryverbose`).enabled = false;

if (args.flags["verbose"]) logger.channel(`verbose`).enabled = true;
if (args.tally["verbose"] >= 2) logger.channel(`veryverbose`).enabled = true;

logger.channel("log").addHandler((string) => {
    FS.appendFileSync(logFilename(), string + "\n");
});

logger.channel("verbose").addHandler((string) => {
    FS.appendFileSync(logFilename(), string + "\n");
});

logger.channel("veryverbose").addHandler((string) => {
    FS.appendFileSync(logFilename(), string + "\n");
});

const all = logger.all();
export { all as default, args };
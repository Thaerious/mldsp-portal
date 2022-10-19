import Logger from "@thaerious/logger";
import {mkdirif} from "@thaerious/utility";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs"

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

if (args.flags["verbose"]) appLogger.channel(`verbose`).enabled = true;

appLogger.channel(`log`).log = (text) => {
    FS.appendFileSync("log/log.text", text + "\n");
}

appLogger.channel("error").log = function(string){
    console.error("Error: see log files");
    const path = mkdirif(process.env.LOG_DIR, "error.log");
    FS.appendFileSync(path, "\n *** " + new Date().toString() + "\n" + string + "\n");
}

export default appLogger.all();
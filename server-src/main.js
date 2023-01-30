import Server from "./Server.js";
import ParseArgs from "@thaerious/parseargs";
import CONST from "./constants.js";

(async () => {
    const args = new ParseArgs().run();

    if (args.flags["print-const"]) console.log(CONST);
    if (args.flags["print-env"]) console.log(process.env);

    const port = args.flags["port"];
    const server = new Server();
    await server.init();
    server.start(port);
})()
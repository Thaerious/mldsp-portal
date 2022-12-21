import Server from "./Server.js";
import ParseArgs from "@thaerious/parseargs";

(async () => {
    const args = new ParseArgs().run();    
    const port = args.flags["port"];
    const server = new Server();
    await server.init();
    server.start(port);
})()
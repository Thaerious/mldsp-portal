import config from "./config.js";
import Express from "express";
import http from "http";
import https from "https";
import helmet from "helmet";
import Logger from "@thaerious/logger";
import cors from "./cors.js";
import loginRoute from "./routes/loginRoute.js";
import logRoute from "./routes/000-logRoute.js";
import uploadRoute from "./routes/uploadRoute.js";
import apiRouter, { config as apiconfig } from "mldsp-api";
import pkg from "express-openid-connect";
import ParseArgs from "@thaerious/parseargs";
import FS from "fs";
const { auth, requiresAuth } = pkg;

const logger = Logger.getLogger().channel("server");
let parseArgs = new ParseArgs().run();
Logger.getLogger().channel("verbose").enabled = parseArgs.count("v") >= 1;

Logger.getLogger().channel("verbose").log(JSON.stringify(apiconfig, null, 2));

(() => {
    const app = Express();

    // create the default data directory
    if (!FS.existsSync(config.DATA_DEFAULT)) {
        FS.mkdirSync(config.DATA_DEFAULT, { recursive: true });
    }

    app.set("views", config.server.SOURCE_VIEW);
    app.set("view engine", "ejs");

    app.use(logRoute);
    // app.use(helmet()); // automatic security settings (outgoing response headers)
    // app.use(cors);

    app.use(auth(config.auth));

    // Middleware to make the `user` object available for all views
    app.use(function (req, res, next) {
        res.locals.user = req.oidc.user;
        next();
    });

    app.use(apiRouter);
    app.use(uploadRoute);

    // comes last because loginRoute will attempt to resolve urls into views
    app.use(loginRoute);

    const httpServer = http.createServer(app);
    httpServer.listen(process.env.PORT, process.env.LIST_IP, () => {
        console.log(`Listening on port ${process.env.PORT}`);
    });

    try{
        const key = FS.readFileSync(process.env.SSL_KEY);
        const cert = FS.readFileSync(process.env.SSL_CERT);    
        const httpsServer = https.createServer({cert, key}, app);
        httpsServer.listen(process.env.SSL_PORT, process.env.LIST_IP, () => {
            console.log(`Listening on port ${process.env.SSL_PORT}`);
        });
    } catch (err) {
	console.log(err);
        console.log(`HTTPS Server Not Started.`);
    }

    process.on(`SIGINT`, () => stop(httpServer));
    process.on(`SIGTERM`, () => stop(httpServer));
})();

function stop(server) {
    console.log(`Stopping server`);
    server.close();
    process.exit();
}

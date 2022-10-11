import Express from "express";
import pkg from "express-openid-connect";
import config from "../config.js";

const { auth } = pkg;
const apiRouter = Express.Router();

apiRouter.use(auth(config.auth));

// Middleware to make the `user` object available for all views
apiRouter.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    next();
});

export default apiRouter;
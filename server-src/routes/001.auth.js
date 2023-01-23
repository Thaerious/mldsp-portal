import Express from "express";
import pkg from "express-openid-connect";
import CONST from "../constants.js";
const { auth } = pkg;

const route = Express.Router();

route.use(CONST.AUTH);

// Middleware to make the `user` object available for all views
route.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    next();
});

export default route;
import Express from "express";
import pkg from "express-openid-connect";
const { auth } = pkg;

const route = Express.Router();

const authOptions = {
    authRequired: false,
    auth0Logout: true,
    baseURL: `http://localhost:${process.env.PORT}`,
    routes: {
        callback: `/success`,
        postLogoutRedirect: `/index`,
        login: false,
    }
};

route.use(auth(authOptions));

// Middleware to make the `user` object available for all views
route.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    console.log(req.method + ' ' + req.originalUrl + ' ' + req.oidc.user.email);
    next();
});

export default route;
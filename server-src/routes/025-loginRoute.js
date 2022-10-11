import config from "../config.js";
import Express from "express";
import pkg from "express-openid-connect";

const { requiresAuth } = pkg;
const router = Express.Router();

router.post("/success", (req, res, next) => {});

router.get("/login", (req, res) => {    
    res.oidc.login({ returnTo: "/dashboard" });
});

export default router;

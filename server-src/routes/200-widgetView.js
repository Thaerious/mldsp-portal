import express from "express";
import { WidgetMiddleware } from "@html-widget/core"
import eoc from "express-openid-connect";
const { requiresAuth } = eoc;

const router = express.Router();
const middleware = new WidgetMiddleware();

router.use("/index", (req, res, next) => {
    const data = {
        isAuthenticated : req.oidc.isAuthenticated()
    }
    middleware.middleware(req, res, next, data);
});

router.use("/dashboard", requiresAuth(), (req, res, next) => {
    const data = {
        isAuthenticated : req.oidc.isAuthenticated()
    }
    middleware.middleware(req, res, next, data);
});

export default router;
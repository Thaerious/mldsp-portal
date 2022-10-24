import express from "express";
import { WidgetMiddleware } from "@html-widget/core"

const router = express.Router();
const middleware = new WidgetMiddleware();

router.use((req, res, next) => {
    const data = {
        isAuthenticated : req.oidc.isAuthenticated()
    }
    middleware.middleware(req, res, next, data);
});

export default router;
import express from "express";
import { WidgetMiddleware } from "@html-widget/core"

const router = express.Router();
const middleware = new WidgetMiddleware();

router.use((req, res, next) => middleware.middleware(req, res, next));

export default router;
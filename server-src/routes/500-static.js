import express from "express";

const router = express.Router();

router.use(express.static(`www/static`));
router.use(express.static(`www/compiled`));
router.use(express.static(`www/linked`));

export default router;
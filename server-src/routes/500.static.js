import express from "express";

const router = express.Router();

router.use(express.static(`www/compiled`));
router.use(express.static(`www/views`));

export default router;
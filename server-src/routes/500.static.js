import express from "express";

const router = express.Router();

router.use(express.static(`www/views`));
router.use(express.static(`www/compiled`));

export default router;
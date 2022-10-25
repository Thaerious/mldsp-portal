import express from "express";

const router = express.Router();
router.use(`*`, (req, res) => {
    res.statusMessage = `404 Page Not Found: ${req.originalUrl}`;
    res.status(404);
    res.send(`404: page not found`);
    res.end();
});

export default router;
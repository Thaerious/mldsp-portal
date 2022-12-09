import Express from "express";

const router = Express.Router();

router.post("/success", (req, res, next) => {});

router.get("/login", (req, res) => {    
    res.oidc.login({ returnTo: "/dashboard" });
});

export default router;

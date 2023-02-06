import Express from "express";
const router = Express.Router();

router.use("[/]", (req, res, next)=>{
    res.render("index/index.ejs", {}, (err, html) => {
        if (err) throw new Error(err); 
        else res.send(html);
    });
});

router.use("/index$", (req, res, next)=>{
    res.render("index/index.ejs", {}, (err, html) => {
        if (err) throw new Error(err); 
        else res.send(html);
    });
});

router.use("/dashboard$", (req, res, next)=>{
    res.render("dashboard/dashboard.ejs", {}, (err, html) => {
        if (err) throw new Error(err); 
        else res.send(html);
    });
});

router.use("/analytics$", (req, res, next)=>{
    res.render("analytics/analytics.ejs", {}, (err, html) => {
        if (err) throw new Error(err); 
        else res.send(html);
    });
});

export default router;

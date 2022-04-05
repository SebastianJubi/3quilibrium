"use strict";
const express = require("express");
const router = express.Router();

router.post("/createSession", (req, res) => {
    try {
        console.log("/createSession called", req.body);
        req.session.appUser = req.body.appUser;
        req.session.token = req.body.appUser.token;
        return res
            .status(200)
            .send({ status: true, message: "ok", appUser: req.body.appUser });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/verifySession", (req, res) => {
    try {
        console.log("/verifySession called", req.session);
        if (req.session && req.session.appUser && req.session.token) {
            return res
                .status(200)
                .send({ status: true, message: "ok", appUser: req.session.appUser });
        } else {
            return res
                .status(403)
                .send({ status: false, message: "expired or invalid token" });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/logout", (req, res) => {
    console.log("/logout called");
    req.session.destroy();
    res.clearCookie(process.env.COOKIE_NAME);
    return res.status(200).redirect("/");
});

module.exports = router;
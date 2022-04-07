"use strict";
const express = require("express");
const router = express.Router();

const userDbService = require("../dbops/user.dbops");

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
    return res.status(200).send({ status: true, message: "logout successful", data: "logout successful" });
});

router.patch("/password/:username", async (req, res) => {
    try {
        if (req.params.username && req.body && req.body.old && req.body.old.trim() && req.body.new && req.body.new.trim()) {
            const oldPass = String(req.body.old.trim());
            const newPass = String(req.body.new.trim());
            const userResp = await userDbService.getAppuserByOptions({ username: req.params.username, password: oldPass });
            if (!userResp) {
                return res
                    .status(404)
                    .send({ status: false, message: "User not found", data: null });
            }
            userResp.password = newPass;
            const updateResp = await userDbService.updateAppuser(userResp);
            if (updateResp) {
                return res
                    .status(200)
                    .send({ status: true, message: "User's password updated", data: updateResp });
            }
            return res
                .status(409)
                .send({ status: false, message: "User's password not updated", data: null });
        }
        return res
            .status(400)
            .send({ status: false, message: "Required fields missing", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

module.exports = router;
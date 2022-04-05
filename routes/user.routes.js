"use strict";
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const userDbService = require("../dbops/user.dbops");
const userDbModel = require("../models/user.models");

const isUserLoggedIn = (req, res, next) => {
    if (!req.user || (req.user.tags && req.user.tags.role !== "user")) {
        return res.redirect(`${process.env.BASE_URL}/`);
    }
    next();
}

router.post("/login", async (req, res) => {
    try {
        if (req.body && req.body.username && req.body.password) {
            // query admin from db
            let userResp = await userDbService.getAppuserByOptions(
                {
                    "tags.role": "user",
                    username: req.body.username,
                    password: req.body.password
                });
            // on success
            if (userResp) {
                const token = generateAccessToken({ id: userResp.username });
                return res
                    .status(200)
                    .send({
                        status: true,
                        message: "Login successful",
                        data: userResp,
                        token
                    });
            }
            // on failure
            return res
                .status(404)
                .send({ status: false, message: "User not found", data: null });
        }
        return res
            .status(400)
            .send({ status: false, message: "Required fields missing", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.post("/createSession", (req, res) => {
    try {
        console.log("/createSession called", req.body);
        req.session.appUser = req.body.appUser;
        req.session.token = req.body.token;
        return res
            .status(200)
            .send({ status: true, message: "ok", appUser: req.body.appUser });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/verifySession", isUserLoggedIn, (req, res) => {
    try {
        console.log("/verifySession called", req.session);
        if (req.session && req.session.appUser && req.session.token) {
            return res
                .status(200)
                .send({ status: true, message: "ok", appUser: req.session.appUser });
        } else {
            return res
                .status(403)
                .send({ status: true, message: "expired or invalid token" });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/logout", isUserLoggedIn, (req, res) => {
    console.log("/logout called");
    req.session.destroy();
    res.clearCookie(process.env.COOKIE_NAME);
    return res.status(200).send({ status: true, message: "logout successful", data: "logout successful" });
});

function generateAccessToken(id) {
    try {
        return jwt.sign(id, process.env.SESSION_SECRET, { expiresIn: String(86400000 + +new Date() - +new Date().setHours(0, 0, 0, 0)) });
    } catch (e) {
        console.log("jwt error", e.message);
        return null;
    }
}

module.exports = router;
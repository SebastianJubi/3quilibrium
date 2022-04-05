"use strict";
const path = require("path");

const ENV = process.argv[2] || process.env.NODE_ENV || "dev";
if (ENV === "production") {
    require("dotenv").config();
} else {
    require("dotenv").config({ path: path.join(__dirname, ".env-dev") });
}

const cors = require("cors");
const redis = require("redis");
const logger = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const connectRedis = require("connect-redis");

const setCurrentUser = require("./middlewares/setCurrentUser.middleware");
const isUserLoggedIn = require("./middlewares/isUserLoggedIn.middleware");
const logRequest = require("./middlewares/logRequest.middleware");

const adminRouter = require("./routes/admin.routes");
const userRouter = require("./routes/user.routes");
const dashboardRouter = require("./routes/dashboard.routes");

const app = express();
const RedisStore = connectRedis(session);

var redisClient;

const SETUP = {
    ip: process.env.IP || "127.0.0.1",
    port: process.env.PORT || 3000,
    redis: {
        acl: process.env.ACL.toLowerCase() === "true",
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        user: process.env.REDIS_USER || "default",
        password: process.env.REDIS_PASSWORD,
    },
    cookie: {
        name: process.env.COOKIE_NAME || "connect.sid",
        secret: process.env.SESSION_SECRET || ""
    },
    dbURL: process.env.DB_URL || "mongodb://localhost:27017/3equilibrium"
};

const RedisInit = () => {
    if (SETUP.redis.acl) {
        redisClient = redis.createClient(SETUP.redis.port, SETUP.redis.host, {
            no_ready_check: true,
        });
        redisClient.on("connect", function () {
            console.log("Connected for acl", SETUP.redis.acl);
        });
        redisClient.on("error", (err) => {
            console.log("redis client error", err);
        });
        redisClient["auth"] = null;
        redisClient.send_command("AUTH", [SETUP.redis.user, SETUP.redis.password]);
    } else {
        redisClient = redis.createClient(SETUP.redis.port, SETUP.redis.host, {
            user: SETUP.redis.user,
            auth_pass: SETUP.redis.password,
        });
        redisClient.on("connect", function () {
            console.log("Connected for acl", SETUP.redis.acl);
        });
        redisClient.on("error", (err) => {
            console.log("redis client error", err);
        });
    }
}

mongoose.connect(SETUP.dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
RedisInit();

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        name: SETUP.cookie.name,
        secret: SETUP.cookie.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: "auto",
            httpOnly: true,
            maxAge: 86400000 + +new Date() - +new Date().setHours(0, 0, 0, 0), //* setting expiry on the current date
        },
    })
);

app.use(logRequest);
app.use(setCurrentUser);

app.use("/user/api", userRouter);
app.use("/admin/api", adminRouter);
app.use("/dashboard/api", isUserLoggedIn, dashboardRouter);
// app.use("/api/meditation", isLoggedIn, meditationRouter);
// app.use("/api/entertainment", isLoggedIn, entertainmentRouter);

app.use("/", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
    return res.redirect("./login/");
});

const server = app.listen(SETUP.port, SETUP.ip, () => {
    console.log(`Server started on ${SETUP.ip}:${SETUP.port}`);
});

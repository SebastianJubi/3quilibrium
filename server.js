"use strict";
const fs = require("fs");
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
const userRouter = require("./routes/login.routes");
const dashboardRouter = require("./routes/dashboard.routes");
const chatRouter = require("./routes/chat.routes");
const reminderRouter = require("./routes/reminder.routes");
const meditationRouter = require("./routes/meditation.routes");
const musicRouter = require("./routes/music.routes");
const gameRouter = require("./routes/game.routes");

const socketService = require("./services/socket.io");

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
            maxAge: 86400000 - (+new Date() - +new Date().setHours(0, 0, 0, 0)), //* setting expiry on the current date
        },
    })
);

app.use(logRequest);
app.use(setCurrentUser);

app.use("/admin/api", adminRouter);
app.use("/user/api", userRouter);
app.use("/dashboard/api", isUserLoggedIn, dashboardRouter);
app.use("/chat/api", isUserLoggedIn, chatRouter);
app.use("/reminder/api", isUserLoggedIn, reminderRouter);
app.use("/meditation/api", isUserLoggedIn, meditationRouter);
app.use("/music/api", isUserLoggedIn, musicRouter);
app.use("/game/api", isUserLoggedIn, gameRouter);


app.use("/", express.static(path.join(__dirname, "pages")));

app.get("/", (req, res) => {
    return res.redirect("./login/");
});

app.get("/admin", (req, res) => {
    const settings = JSON.parse(fs.readFileSync(`./models/settings.json`));
    return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
        <title>3QUILIBRIUM | Admin</title>
    </head>
    <body>
        <script type="text/javascript" src="./assets/scripts/loader.js" async defer></script>
        <section id="app-loader-3quilibrium" class="app-loader-3quilibrium"
            data-description="Maintaining balance between the 3 essentials - work, life and health"
            data-logo="${process.env.COMPANY_LOGO}" data-cologo="../shared/medias/3quilibrium.png"
            style="
                --color-theme-button-primary: ${settings.color.button.primary};
                --color-theme-button-secondary: ${settings.color.button.secondary};
                --color-theme-text-primary: ${settings.color.text.primary};
                --color-theme-text-secondary: ${settings.color.text.secondary};">
        </section>
    </body>
    </html>
    `);
});

app.get("/admin/:page", (req, res) => {
    const settings = JSON.parse(fs.readFileSync(`./models/settings.json`));
    return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
        <title>3QUILIBRIUM | Admin</title>
    </head>
    <body>
        <script type="text/javascript" src="./scripts/loader.js" async defer></script>
        <section id="app-loader-3quilibrium" class="app-loader-3quilibrium"
            data-description="Maintaining balance between the 3 essentials - work, life and health"
            data-logo="${process.env.COMPANY_LOGO}" data-cologo="../../shared/medias/3quilibrium.png"
            style="
                --color-theme-button-primary: ${settings.color.button.primary};
                --color-theme-button-secondary: ${settings.color.button.secondary};
                --color-theme-text-primary: ${settings.color.text.primary};
                --color-theme-text-secondary: ${settings.color.text.secondary};">
        </section>
    </body>
    </html>
    `);
});

app.get("/:page", (req, res) => {
    const settings = JSON.parse(fs.readFileSync(`./models/settings.json`));
    return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:;base64,iVBORw0KGgo=" />
        <title>3QUILIBRIUM | ${req.params.page.toUpperCase()}</title>
    </head>
    <body>
        <script type="text/javascript" src="./scripts/loader.js" async defer></script>
        <section id="app-loader-3quilibrium" class="app-loader-3quilibrium"
            data-description="Maintaining balance between the 3 essentials - work, life and health"
            data-logo="${process.env.COMPANY_LOGO}" data-cologo="../shared/medias/3quilibrium.png"
            style="
                --color-theme-button-primary: ${settings.color.button.primary};
                --color-theme-button-secondary: ${settings.color.button.secondary};
                --color-theme-text-primary: ${settings.color.text.primary};
                --color-theme-text-secondary: ${settings.color.text.secondary};">
        </section>
    </body>
    </html>
    `);
});

const server = app.listen(SETUP.port, SETUP.ip, () => {
    console.log(`Server started on ${SETUP.ip}:${SETUP.port}`);
});

/* SOCKET.IO */
const { Server } = require("socket.io");
global.io = new Server(server, {
    path: "/socket"
});
socketService.init();

app.get("/broadcast/:type", (req, res) => {
    try {
        console.log("/socket called");
        switch (req.params.type) {
            case "officeStart":
                socketService.emit("notify", { type: "broadcast", message: "office start" });
                break;
            case "officeEnd":
                socketService.emit("notify", { type: "broadcast", message: "office end" });
                break;
            case "water":
                socketService.emit("notify", { type: "broadcast", message: "water break" });
                break;
            case "break":
                socketService.emit("notify", { type: "broadcast", message: "work break" });
                break;
            case "work":
                socketService.emit("notify", { type: "broadcast", message: "work resume" });
                break;
            case "reminder":
                socketService.emit("notify", {
                    type: "reminder", message: "reminder received", data: {
                        "_id": "625145c39fbcdac38d0358ab",
                        "username": "sebastian",
                        "message": "Reminder Demo",
                        "time": "2022-04-09T08:38:00.000Z",
                        "timestamp": 1649492883934,
                        "__v": 0
                    }
                });
                break;
            case "lunchStart":
                socketService.emit("notify", { type: "broadcast", message: "lunch break start" });
                break;
            case "lunchEnd":
                socketService.emit("notify", { type: "broadcast", message: "lunch break end" });
                break;
            case "snackStart":
                socketService.emit("notify", { type: "broadcast", message: "snacks break start" });
                break;
            case "snackEnd":
                socketService.emit("notify", { type: "broadcast", message: "snacks break end" });
                break;
        }
        return res
            .status(200)
            .send({ status: true, message: "ok", appUser: req.session.appUser });

    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});
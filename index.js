const express = require("express");
const app = express();
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const session = require("express-session");
const PORT = process.env["PORT"] || 8095;
const log = require("./src/log.js")
const db = require("./database/database.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const server = createServer(app);
const io = new Server(server);
require("./socket.js")(io);

app.use(session({
    secret: "ds65f4sd6gfd69df4g",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());



app.set("view engine", "ejs");

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    if(username == "System"){
        return res.status(400).json({ message: "You can't take this name." });
    }
    if(username.length < 3 || username.length > 20) {
        return res.status(400).json({ message: "Username must be between 3 and 20 characters." });
    }

    const userExists = await db.findOne("users", { username });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    await db.insertOne("users", { username, password });
    return res.status(200).json({ message: "Registration successful" });
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await db.findOne("users", { username, password });
    if (!user) {
        return res.status(401).json({ message: "Incorrect username or password" });
    }

    req.session.userID = user._id;
    req.session.username = username;
    req.session.password = password;
    res.status(200).json({ message: "Login successful", userID: user._id, username });
});

app.get("/api/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "An error occurred while logging out." });
        res.status(200).json({ message: "Logout successful" });
    });
});

app.get("/api/messages", async (req, res) => {
    try {
        let messages = await db.find("messages");
        res.status(200).json(messages);
    } catch (error) {
        console.error("fetch message error:", error.message);
        res.status(500).json({ message: "An error occurred while retrieving messages." });
    }
});

app.get("/", (req, res) => {
    res.render("index",{session:req.session});
});

server.listen(PORT, () => {
    log("green", `Server running on ${PORT}`);
});

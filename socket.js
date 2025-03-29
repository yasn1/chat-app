const db = require("./database/database.js");

const users = {}; 
const activeUsers = new Set();
let size = 0;

const socket = (io) => {
    io.on("connection", async (socket) => {
        const userID = socket.handshake.auth.userID || null;
        if (userID) {
            if (!activeUsers.has(userID)) { 
                size += 1;
                await db.insertOne("messages", { name: "System", message: `${userID} joined the chat.`, timestamp: new Date() });
                io.emit("chat message", { userID: "System", message: `${userID} joined the chat.` ,size});
            }

            users[socket.id] = userID;
            activeUsers.add(userID);
        }

        socket.on("disconnect", async () => {
            if (users[socket.id]) {
                activeUsers.delete(users[socket.id]);
                size -= 1;
                await db.insertOne("messages", { name: "System", message: `${users[socket.id]} left the chat.`, timestamp: new Date() });
                io.emit("chat message", { userID: "System", message: `${users[socket.id]} left the chat.` ,size});
                delete users[socket.id];
            }
        });

        socket.on("chat message", async (msg) => {
            try {
                const user = users[socket.id] || "Anonim";

                await db.insertOne("messages", { name: user, message: msg, timestamp: new Date() });
                io.emit("chat message", { userID: user, message: msg });
            } catch (error) {
                console.error("database error:", error.message);
            }
        });
    });
};

module.exports = socket;

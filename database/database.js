const Db = require("oxzof-nosql");
const db = new Db();
db.createCollection("users")
db.createCollection("messages")

module.exports = db;
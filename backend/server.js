const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const app = express();
app.use(express.json());

const DB_FILE = "./backend/users.json";

function loadUsers() {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}



app.listen(3000, () => {
    console.log("Register API çalışıyor: http://localhost:3000/register");
});

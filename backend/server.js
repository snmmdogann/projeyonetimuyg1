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

app.post("/register", async (req, res) => {
    const { username, email, password, passwordConfirm } = req.body;

    if (!username || !email || !password || !passwordConfirm) {
        return res.status(400).json({ message: "Tüm alanlar gereklidir." });
    }

    if (password !== passwordConfirm) {
        return res.status(400).json({ message: "Şifreler eşleşmiyor!" });
    }

    let users = loadUsers();

    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ message: "Bu e-posta zaten kayıtlı!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: Date.now(),
        username,
        email,
        password: hashedPassword
    };

    users.push(newUser);
    saveUsers(users);

    return res.status(201).json({
        message: "Kullanıcı başarıyla oluşturuldu.",
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        }
    });
});

app.listen(3000, () => {
    console.log("Register API çalışıyor: http://localhost:3000/register");
});

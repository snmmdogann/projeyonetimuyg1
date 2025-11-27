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
// LOGIN API (AUTH-5)
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Alan kontrolü
    if (!email || !password) {
        return res.status(400).json({ message: "E-posta ve şifre gereklidir." });
    }

    let users = loadUsers();

    // E-posta kayıtlı mı?
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ message: "Bu e-posta ile kayıtlı kullanıcı bulunamadı." });
    }

    // Şifre doğru mu?
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(400).json({ message: "Şifre yanlış!" });
    }

    // Başarılı giriş
    return res.status(200).json({
        message: "Giriş başarılı",
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
});

const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const app = express();
app.use(express.json());

const DB_FILE = "./backend/users.json";

// Kullanıcıları yükle
function loadUsers() {
    if (!fs.existsSync(DB_FILE)) return [];
    return JSON.parse(fs.readFileSync(DB_FILE));
}

// Kullanıcıları kaydet
function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

/* ============================
   AUTH-4: Kayıt API (Register)
============================ */
app.post("/register", async (req, res) => {
    const { username, email, password, passwordConfirm } = req.body;

    // Alan kontrolü
    if (!username || !email || !password || !passwordConfirm) {
        return res.status(400).json({ message: "Tüm alanlar gereklidir." });
    }

    if (password !== passwordConfirm) {
        return res.status(400).json({ message: "Şifreler eşleşmiyor!" });
    }

    let users = loadUsers();

    // E-posta daha önce kullanılmış mı?
    const exists = users.find(u => u.email === email);
    if (exists) {
        return res.status(400).json({ message: "Bu e-posta zaten kayıtlı!" });
    }

    // Şifreyi hashle
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
        message: "Kullanıcı başarıyla kaydedildi.",
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        }
    });
});

/* ============================
   AUTH-5: Login API
============================ */
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Alan kontrolü
    if (!email || !password) {
        return res.status(400).json({ message: "E-posta ve şifre gereklidir." });
    }

    let users = loadUsers();

    // Kullanıcı var mı?
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ message: "Bu e-posta ile kayıtlı kullanıcı bulunamadı." });
    }

    // Şifre doğru mu?
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(400).json({ message: "Şifre yanlış!" });
    }

    return res.status(200).json({
        message: "Giriş başarılı",
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
});

/* ============================
   AUTH-6: Şifre Sıfırlama API
============================ */
app.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    // Alan kontrolü
    if (!email || !newPassword) {
        return res.status(400).json({ message: "E-posta ve yeni şifre gereklidir." });
    }

    let users = loadUsers();

    // Kullanıcı var mı?
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(404).json({ message: "Bu e-posta ile kayıtlı kullanıcı bulunamadı." });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Güncel listeyi kaydet
    saveUsers(users);

    return res.status(200).json({
        message: "Şifre başarıyla güncellendi.",
        email: user.email
    });
});

app.listen(3000, () => {
    console.log("API çalışıyor: http://localhost:3000");
});

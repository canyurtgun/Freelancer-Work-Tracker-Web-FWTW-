const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization || "").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Oturum yok" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, fullName: true, role: true },
    });
    if (!user) return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    res.json({ user });
  } catch {
    return res.status(401).json({ error: "Geçersiz oturum" });
  }
});

module.exports = router;

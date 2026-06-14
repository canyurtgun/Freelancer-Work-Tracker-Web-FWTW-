const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { requireAuth, requireAdmin, prisma } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireAdmin);

function generatePassword(length = 12) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[crypto.randomInt(chars.length)];
  }
  return pass;
}

// GET /api/users
router.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kullanıcılar alınamadı" });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const { username, fullName, role, password: manualPassword, autoGenerate } = req.body;
    if (!username || !fullName) {
      return res.status(400).json({ error: "Kullanıcı adı ve ad soyad gerekli" });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
    }

    const plainPassword = autoGenerate ? generatePassword() : manualPassword;
    if (!plainPassword || plainPassword.length < 4) {
      return res.status(400).json({ error: "Şifre en az 4 karakter olmalı" });
    }

    const hash = await bcrypt.hash(plainPassword, 10);
    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        role: role === "admin" ? "admin" : "user",
        password: hash,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ user, generatedPassword: autoGenerate ? plainPassword : undefined });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kullanıcı oluşturulamadı" });
  }
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const { fullName, role, username } = req.body;
    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (role !== undefined) data.role = role === "admin" ? "admin" : "user";
    if (username !== undefined) data.username = username;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, username: true, fullName: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Bu kullanıcı adı zaten kullanılıyor" });
    }
    console.error(err);
    res.status(500).json({ error: "Kullanıcı güncellenemedi" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: "Kendinizi silemezsiniz" });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kullanıcı silinemedi" });
  }
});

// POST /api/users/:id/reset-password
router.post("/:id/reset-password", async (req, res) => {
  try {
    const { password: manualPassword, autoGenerate } = req.body;
    const plainPassword = autoGenerate ? generatePassword() : manualPassword;
    if (!plainPassword || plainPassword.length < 4) {
      return res.status(400).json({ error: "Şifre en az 4 karakter olmalı" });
    }

    const hash = await bcrypt.hash(plainPassword, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hash },
    });

    res.json({ ok: true, generatedPassword: autoGenerate ? plainPassword : undefined });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Şifre sıfırlanamadı" });
  }
});

module.exports = router;

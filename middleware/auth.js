const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "freelance-tracker-secret";

function requireAuth(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization || "").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Oturum gerekli" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ error: "Geçersiz veya süresi dolmuş oturum" });
  }
}

function requireAdmin(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Bu işlem için admin yetkisi gerekli" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, prisma, JWT_SECRET };

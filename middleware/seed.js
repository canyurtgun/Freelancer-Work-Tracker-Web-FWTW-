const bcrypt = require("bcryptjs");
const { prisma } = require("./auth");

async function seedAdmin() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await prisma.user.create({
        data: {
          username: "admin",
          password: hash,
          fullName: "Sistem Yöneticisi",
          role: "admin",
        },
      });
      console.log("✓ Varsayılan admin hesabı oluşturuldu (admin / admin123)");
    }
  } catch (err) {
    console.error("Seed hatası:", err.message);
  }
}

module.exports = { seedAdmin };

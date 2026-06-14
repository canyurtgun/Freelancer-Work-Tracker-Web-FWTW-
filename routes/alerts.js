const express = require("express");
const { requireAuth, prisma } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// GET /api/alerts
router.get("/", async (_req, res) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    // Active statuses
    const activeStatuses = ["planning", "in_progress", "review"];

    const projects = await prisma.project.findMany({
      where: {
        status: { in: activeStatuses },
        deliveryDate: { not: null },
      },
      include: {
        users: {
          include: { user: { select: { id: true, fullName: true } } },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { deliveryDate: "asc" },
    });

    const overdue = [];
    const upcoming = [];

    for (const p of projects) {
      const delivery = new Date(p.deliveryDate);
      delivery.setHours(23, 59, 59, 999);

      const flat = {
        id: p.id,
        title: p.title,
        customerName: p.customerName,
        status: p.status,
        deliveryDate: p.deliveryDate,
        startDate: p.startDate,
        users: (p.users || []).map((pu) => pu.user),
      };

      if (now > delivery) {
        const diffDays = Math.ceil((now - delivery) / 86400000);
        overdue.push({ ...flat, daysOverdue: diffDays });
      } else if (delivery <= threeDaysLater) {
        const diffDays = Math.ceil((delivery - now) / 86400000);
        upcoming.push({ ...flat, daysUntil: diffDays });
      }
    }

    res.json({ overdue, upcoming });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Uyarılar alınamadı" });
  }
});

module.exports = router;

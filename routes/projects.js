const express = require("express");
const { requireAuth, requireAdmin, prisma } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

const projectInclude = {
  extras: true,
  users: {
    include: { user: { select: { id: true, username: true, fullName: true, role: true } } },
    orderBy: { sortOrder: "asc" },
  },
};

function flattenProject(p) {
  return {
    ...p,
    users: (p.users || []).map((pu) => ({
      ...pu.user,
      sortOrder: pu.sortOrder,
    })),
  };
}

// GET /api/projects
router.get("/", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: projectInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json(projects.map(flattenProject));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Projeler alınamadı" });
  }
});

// POST /api/projects
router.post("/", async (req, res) => {
  try {
    const { title, customerName, content, price, deposit, startDate, deliveryDate, status, notes, extras, assignedUsers } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Proje başlığı zorunludur" });
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        customerName: customerName?.trim() || null,
        content: content?.trim() || null,
        price: parseFloat(price) || 0,
        deposit: parseFloat(deposit) || 0,
        startDate: startDate ? new Date(startDate) : null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        status: status || "planning",
        notes: notes?.trim() || null,
        completedAt: status === "completed" ? new Date() : null,
        extras: {
          create: (extras || []).map((e) => ({
            label: e.label?.trim() || "",
            price: parseFloat(e.price) || 0,
            status: e.status || "pending",
          })),
        },
        users: {
          create: (assignedUsers || []).map((userId, idx) => ({
            userId,
            sortOrder: idx,
          })),
        },
      },
      include: projectInclude,
    });

    res.status(201).json(flattenProject(project));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proje oluşturulamadı" });
  }
});

// PUT /api/projects/:id
router.put("/:id", async (req, res) => {
  try {
    const { title, customerName, content, price, deposit, startDate, deliveryDate, status, notes, extras, assignedUsers } = req.body;

    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Proje bulunamadı" });

    let completedAt = existing.completedAt;
    if (status === "completed" && !existing.completedAt) {
      completedAt = new Date();
    } else if (status && status !== "completed") {
      completedAt = null;
    }

    // Delete existing extras and recreate
    await prisma.extra.deleteMany({ where: { projectId: req.params.id } });

    // Delete existing user assignments and recreate
    if (assignedUsers !== undefined) {
      await prisma.projectUser.deleteMany({ where: { projectId: req.params.id } });
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title: title?.trim() ?? existing.title,
        customerName: customerName?.trim() ?? existing.customerName,
        content: content?.trim() ?? existing.content,
        price: price !== undefined ? parseFloat(price) || 0 : existing.price,
        deposit: deposit !== undefined ? parseFloat(deposit) || 0 : existing.deposit,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate,
        deliveryDate: deliveryDate !== undefined ? (deliveryDate ? new Date(deliveryDate) : null) : existing.deliveryDate,
        status: status || existing.status,
        notes: notes?.trim() ?? existing.notes,
        completedAt,
        extras: {
          create: (extras || []).map((e) => ({
            label: e.label?.trim() || "",
            price: parseFloat(e.price) || 0,
            status: e.status || "pending",
          })),
        },
        ...(assignedUsers !== undefined
          ? {
              users: {
                create: assignedUsers.map((userId, idx) => ({
                  userId,
                  sortOrder: idx,
                })),
              },
            }
          : {}),
      },
      include: projectInclude,
    });

    res.json(flattenProject(project));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proje güncellenemedi" });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proje silinemedi" });
  }
});

// PUT /api/projects/:id/users — sıralama güncelle
router.put("/:id/users", async (req, res) => {
  try {
    const { assignedUsers } = req.body;
    await prisma.projectUser.deleteMany({ where: { projectId: req.params.id } });
    if (assignedUsers && assignedUsers.length) {
      await prisma.projectUser.createMany({
        data: assignedUsers.map((userId, idx) => ({
          projectId: req.params.id,
          userId,
          sortOrder: idx,
        })),
      });
    }
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: projectInclude,
    });
    res.json(flattenProject(project));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kullanıcı ataması güncellenemedi" });
  }
});

// GET /api/projects/export — admin only
router.get("/export", requireAdmin, async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: projectInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json(projects.map(flattenProject));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dışa aktarma başarısız" });
  }
});

module.exports = router;

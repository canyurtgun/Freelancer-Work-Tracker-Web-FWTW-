require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { seedAdmin } = require("./middleware/seed");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/projects");
const alertRoutes = require("./routes/alerts");

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/alerts", alertRoutes);

// Static files (production build)
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

const PORT = process.env.PORT || 5000;

async function start() {
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`Server çalışıyor: http://localhost${PORT === 80 ? "" : ":" + PORT}`);
  });
}

start();

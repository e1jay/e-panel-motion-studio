const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_"))
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => /^image\\/(jpeg|png|webp)$/.test(file.mimetype) ? cb(null, true) : cb(new Error("Use a JPG, PNG, or WebP image."))
});
app.get("/api/status", (_req, res) => res.json({
  ok: true,
  message: "Story editor, scene cards, character upload, and browser animation preview are available. Real AI video generation is not connected yet."
}));
app.post("/api/upload-character", upload.single("character"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Choose a picture first." });
  res.json({ ok: true, name: req.file.originalname, imageUrl: "/uploads/" + req.file.filename });
});
app.post("/api/analyze-script", (req, res) => {
  const story = String(req.body.story || "").trim();
  if (!story) return res.status(400).json({ error: "Type a story first." });
  const lines = story.split(/\n+/).map(s => s.trim()).filter(Boolean);
  res.json({ ok: true, scenes: lines.map((line, i) => ({
    number: i + 1,
    title: "Scene " + (i + 1),
    story: line,
    prompt: "Cinematic animation scene: " + line + ". Preserve the character's appearance and visual style."
  }))});
});
app.post("/api/generate-character-image", (_req, res) => res.status(501).json({
  error: "AI character generation is not connected yet. This button is shown as a planned feature, not a working generator."
}));
app.post("/api/generate-scene-video", (_req, res) => res.status(501).json({
  error: "Real AI video generation is not connected yet. The moving preview is a prototype, not a generated movie file."
}));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.use((err, _req, res, _next) => res.status(400).json({ error: err.message || "Something went wrong." }));
app.listen(PORT, () => console.log("Panel Motion Studio running on port " + PORT));

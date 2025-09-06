const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Keep track of uploads by page
let pageFiles = { 1: [], 2: [], 3: [], 4: [] };

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// ✅ Default route for Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle uploads
app.post("/upload", upload.single("myfile"), (req, res) => {
  const page = req.body.page;
  if (!req.file) return res.status(400).send("No file uploaded.");
  if (!pageFiles[page]) pageFiles[page] = [];

  // Save file info for this page
  pageFiles[page].push({
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    original: req.file.originalname,
  });

  res.redirect(`/page${page}.html`);
});

// API to get files for a page
app.get("/files/:page", (req, res) => {
  const page = req.params.page;
  res.json(pageFiles[page] || []);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

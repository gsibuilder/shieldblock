import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API endpoints for ShieldBlock extension data
  app.get("/api/rules/:name", (req, res) => {
    const { name } = req.params;
    const validRules = ["ads_rules", "privacy_rules", "annoyances_rules"];
    if (!validRules.includes(name)) {
      return res.status(404).json({ error: "Ruleset not found" });
    }
    try {
      const filePath = path.join(process.cwd(), "rules", `${name}.json`);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return res.json(data);
      }
      return res.status(404).json({ error: "File not found" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/manifest", (req, res) => {
    try {
      const manifestPath = path.join(process.cwd(), "manifest.json");
      if (fs.existsSync(manifestPath)) {
        const data = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        return res.json(data);
      }
      return res.status(404).json({ error: "manifest.json not found" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ShieldBlock server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

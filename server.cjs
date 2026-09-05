var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((0, import_cors.default)());
  app.use(import_express.default.json());
  app.get("/api/rules/:name", (req, res) => {
    const { name } = req.params;
    const validRules = ["ads_rules", "privacy_rules", "annoyances_rules"];
    if (!validRules.includes(name)) {
      return res.status(404).json({ error: "Ruleset not found" });
    }
    try {
      const filePath = import_path.default.join(process.cwd(), "rules", `${name}.json`);
      if (import_fs.default.existsSync(filePath)) {
        const data = JSON.parse(import_fs.default.readFileSync(filePath, "utf-8"));
        return res.json(data);
      }
      return res.status(404).json({ error: "File not found" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/manifest", (req, res) => {
    try {
      const manifestPath = import_path.default.join(process.cwd(), "manifest.json");
      if (import_fs.default.existsSync(manifestPath)) {
        const data = JSON.parse(import_fs.default.readFileSync(manifestPath, "utf-8"));
        return res.json(data);
      }
      return res.status(404).json({ error: "manifest.json not found" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ShieldBlock server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

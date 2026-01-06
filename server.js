 import express from "express";
 import cors from "cors";
 import fs from "fs";
 import path from "path";
 import { fileURLToPath } from "url";

 const app = express();
 app.use(cors());
 app.use(express.json());
@@ -10,6 +11,7 @@ const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

-const DATA_FILE = path.join(__dirname, "data", "sayings.json");
+const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
+const DATA_FILE = path.join(DATA_DIR, "sayings.json");
 const PUBLIC_DIR = path.join(__dirname, "public");

 app.use(express.static(PUBLIC_DIR));

 function readSayings() {
   return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
 }
 function writeSayings(payload) {
+  fs.mkdirSync(DATA_DIR, { recursive: true });
   fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
 }
@@ -67,7 +69,7 @@ app.post("/api/sayings", (req, res) => {
 });

-const PORT = process.env.PORT || 5173;
+const PORT = process.env.PORT || 10000;
 app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`))
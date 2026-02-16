import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, "../../../frontend/dist");
const targetDir = path.resolve(__dirname, "../../public");

if (!fs.existsSync(sourceDir)) {
  console.log("sync-frontend-build: frontend/dist nao encontrado, pulando copia.");
  process.exit(0);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`sync-frontend-build: frontend copiado para ${targetDir}`);

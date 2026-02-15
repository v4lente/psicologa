import { runAutoMigrations } from "../bootstrap/autoMigrate.js";

async function main() {
  await runAutoMigrations();
}

main().catch((error) => {
  console.error("Falha na migracao automatica:", error);
  process.exit(1);
});

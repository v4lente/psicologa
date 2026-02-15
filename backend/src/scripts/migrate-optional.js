import { runAutoMigrations } from "../bootstrap/autoMigrate.js";

try {
  await runAutoMigrations();
} catch (error) {
  console.warn("Migracao no build falhou (continuando deploy):", error?.message);
}

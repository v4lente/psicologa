import { app } from "./app.js";
import { runAutoMigrations } from "./bootstrap/autoMigrate.js";
import { pingDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./modules/auth/auth.service.js";

async function bootstrap() {
  await runAutoMigrations();
  await pingDatabase();
  await ensureAdminUser();

  app.listen(env.port, () => {
    console.log(`API ativa na porta ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Falha ao iniciar a API:", error);
  process.exit(1);
});

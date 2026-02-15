import { app } from "./app.js";
import { runAutoMigrations } from "./bootstrap/autoMigrate.js";
import {
  markBootstrapAttempt,
  markBootstrapError,
  markBootstrapReady
} from "./bootstrap/runtimeState.js";
import { pingDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./modules/auth/auth.service.js";

const BOOTSTRAP_RETRY_DELAY_MS = 8000;
const BOOTSTRAP_MAX_ATTEMPTS = 25;

async function bootstrapDependencies() {
  for (let attempt = 1; attempt <= BOOTSTRAP_MAX_ATTEMPTS; attempt += 1) {
    markBootstrapAttempt();
    try {
      await runAutoMigrations();
      await pingDatabase();
      await ensureAdminUser();
      markBootstrapReady();
      console.log("Bootstrap de dependencias concluido.");
      return;
    } catch (error) {
      markBootstrapError(error);
      console.error(
        `Bootstrap falhou (tentativa ${attempt}/${BOOTSTRAP_MAX_ATTEMPTS}):`,
        error?.message || error
      );

      if (attempt < BOOTSTRAP_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, BOOTSTRAP_RETRY_DELAY_MS));
      }
    }
  }

  console.error(
    "Bootstrap nao concluiu apos todas as tentativas. API segue ativa para diagnostico em /api/health."
  );
}

app.listen(env.port, () => {
  console.log(`API ativa na porta ${env.port}`);
});

bootstrapDependencies().catch((error) => {
  markBootstrapError(error);
  console.error("Erro inesperado no bootstrap em background:", error);
});

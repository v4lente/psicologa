(async () => {
  try {
    await import("./index.js");
  } catch (error) {
    console.error("Falha ao iniciar app.cjs:", error);
    process.exit(1);
  }
})();

import { AppError } from "../errors/AppError.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details
    });
  }

  if (err?.name === "ZodError") {
    return res.status(422).json({
      error: "Dados invalidos",
      details: err.issues
    });
  }

  if (err?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Registro duplicado" });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor" });
}

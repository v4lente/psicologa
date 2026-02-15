import { z } from "zod";

export const contentSchema = z.object({
  title: z.string().min(5, "Titulo obrigatorio"),
  excerpt: z.string().min(10, "Resumo obrigatorio"),
  body: z.string().min(30, "Conteudo obrigatorio"),
  isFeatured: z.boolean().optional().default(false),
  publishedAt: z.string().optional().nullable()
});

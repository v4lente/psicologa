import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors/AppError.js";

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listPublicContents() {
  const [rows] = await db.query(
    `
      SELECT
        id,
        title,
        slug,
        excerpt,
        body,
        is_featured AS isFeatured,
        published_at AS publishedAt
      FROM contents
      WHERE published_at IS NOT NULL
      ORDER BY is_featured DESC, published_at DESC
      LIMIT 12
    `
  );
  return rows;
}

export async function listAdminContents() {
  const [rows] = await db.query(
    `
      SELECT
        id,
        title,
        slug,
        excerpt,
        body,
        is_featured AS isFeatured,
        published_at AS publishedAt,
        created_at AS createdAt
      FROM contents
      ORDER BY created_at DESC
    `
  );
  return rows;
}

export async function createContent(payload) {
  const slug = slugify(payload.title);
  const publishedAt = payload.publishedAt || new Date().toISOString();

  const [result] = await db.query(
    "INSERT INTO contents (title, slug, excerpt, body, is_featured, published_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      payload.title,
      slug,
      payload.excerpt,
      payload.body,
      payload.isFeatured ? 1 : 0,
      publishedAt
    ]
  );
  return { id: result.insertId };
}

export async function updateContent(id, payload) {
  const slug = slugify(payload.title);
  const [result] = await db.query(
    "UPDATE contents SET title = ?, slug = ?, excerpt = ?, body = ?, is_featured = ?, published_at = ?, updated_at = NOW() WHERE id = ?",
    [
      payload.title,
      slug,
      payload.excerpt,
      payload.body,
      payload.isFeatured ? 1 : 0,
      payload.publishedAt || new Date().toISOString(),
      id
    ]
  );
  if (result.affectedRows === 0) {
    throw new AppError("Conteudo nao encontrado", 404);
  }
}

export async function removeContent(id) {
  const [result] = await db.query("DELETE FROM contents WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    throw new AppError("Conteudo nao encontrado", 404);
  }
}

import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { contentSchema } from "./content.schema.js";
import {
  createContent,
  listAdminContents,
  listPublicContents,
  removeContent,
  updateContent
} from "./content.service.js";

export const listPublic = asyncHandler(async (req, res) => {
  const data = await listPublicContents();
  res.json(data);
});

export const listAdmin = asyncHandler(async (req, res) => {
  const data = await listAdminContents();
  res.json(data);
});

export const create = asyncHandler(async (req, res) => {
  const payload = contentSchema.parse(req.body);
  const data = await createContent(payload);
  res.status(201).json(data);
});

export const update = asyncHandler(async (req, res) => {
  const payload = contentSchema.parse(req.body);
  await updateContent(Number(req.params.id), payload);
  res.status(204).send();
});

export const remove = asyncHandler(async (req, res) => {
  await removeContent(Number(req.params.id));
  res.status(204).send();
});

import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import {
  createGoogleAuthUrl,
  disconnectGoogleIntegration,
  getGoogleIntegrationStatus,
  handleGoogleOAuthCallback
} from "./google.service.js";

export const status = asyncHandler(async (req, res) => {
  const data = await getGoogleIntegrationStatus(Number(req.user.sub));
  res.json(data);
});

export const authUrl = asyncHandler(async (req, res) => {
  const returnTo = req.query.returnTo;
  const data = createGoogleAuthUrl(Number(req.user.sub), returnTo);
  res.json(data);
});

export const callback = asyncHandler(async (req, res) => {
  const redirectUrl = await handleGoogleOAuthCallback({
    code: req.query.code,
    state: req.query.state
  });
  res.redirect(302, redirectUrl);
});

export const disconnect = asyncHandler(async (req, res) => {
  await disconnectGoogleIntegration(Number(req.user.sub));
  res.status(204).send();
});

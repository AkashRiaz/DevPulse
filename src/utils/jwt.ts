import type { IJwtPayLoad } from "./../types/index";

import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";

export const verifyToken = (token: string, type: "access" | "refresh") => {
  const secret =
    type === "access"
      ? config.access_token_secret
      : config.refresh_token_secret;

  const decoded = jwt.verify(token, secret) as JwtPayload;

  return decoded;
};

export const signToken = (payload: IJwtPayLoad) => {
  const accessToken = jwt.sign(payload, config.access_token_secret, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, config.refresh_token_secret, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

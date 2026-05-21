import type { IJwtPayLoad } from "./../types/index";

import jwt from "jsonwebtoken";
import config from "../config";

export const signToken = (payload: IJwtPayLoad) => {
  const accessToken = jwt.sign(payload, config.access_token_secret, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, config.refresh_token_secret, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

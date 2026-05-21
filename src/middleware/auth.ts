import type { NextFunction, Request, Response } from "express";
import type { ROLES } from "../types";
import sendResponse from "../utils/sendResponse";
import { verifyToken } from "../utils/jwt";
import { pool } from "../db";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!",
        });
      }

      const decoded = verifyToken(token as string, "access");

      const userData = await pool.query(
        `
     SELECT * FROM users WHERE id=$1
    `,
        [decoded.id],
      );
      const user = userData.rows[0];
      if (!user) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "User not found!",
        });
        return;
      }

      if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden access!",
        });
        return;
      }

      req.user = decoded;

      next();
    } catch (error: any) {
      next(error);
    }
  };
};

export default auth;

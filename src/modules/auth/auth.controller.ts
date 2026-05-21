import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.signupUserIntoDB(req.body);
    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Failed to signup user",
      });
    }

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to signup user",
      error: error,
    });
  }
};

const signinUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await authService.signinUserFromDB(email, password);
    const { accessToken, refreshToken, user } = result;

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: { token: accessToken, user },
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to signin user",
      error: error,
    });
  }
};

export const authController = {
  signupUser,
  signinUser,
};

import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type, reporter_id } = req.body;
    const result = await issueService.createIssueIntoDB({ title, description, type, reporter_id });
    // sendResponse(res, {
    //   statusCode: 201,
    //   success: true,
    //   message: "Issue created successfully",
    //   data: result
    // });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to create issue",
      error: error,
    });
  }
};

export const issueController = {
  createIssue,
};

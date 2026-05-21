import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const reporter_id = req.user?.id;

    const result = await issueService.createIssueIntoDB({
      title,
      description,
      type,
      reporter_id,
    });

    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Failed to create issue",
      });
    }

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to create issue",
      error: error,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issueService.getSingleIssueFromDB(id as string);
    if (!result) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to get issue",
      error: error,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const requester = req.user as {
      id: number;
      role: "maintainer" | "contributor";
    };

    const result = await issueService.updateIssueIntoDB(
      id as string,
      payload,
      requester,
    );

    if (result.rows.length === 0) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    const message = error.message || "Failed to update issue";
    const statusCode =
      message === "Issue not found"
        ? 404
        : message === "Forbidden access!"
          ? 403
          : 500;

    sendResponse(res, {
      statusCode,
      success: false,
      message,
      error: error,
    });
  }
};

const deleteIssue = async (req:Request, res:Response)=>{
  try {

    const {id} = req.params;

    const result = await issueService.deleteIssueFromDB(id as string);

    if(result.rows.length === 0){
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to delete issue",
      error: error,
    });
  }
}



export const issueController = {
  createIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};

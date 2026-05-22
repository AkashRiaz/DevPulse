import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";
import { ISSUE_SORTING_OPTIONS, ISSUE_STATUS_OPTIONS, ISSUE_TYPE_OPTIONS, type TIssueSortingOption, type TIssueStatusOption, type TIssueTypeOption } from "./issue.interface";

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

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort: sortValue, type, status } = req.query;
    const sort =
      typeof sortValue === "string" && sortValue.length > 0
        ? sortValue
        : "newest";

    if (sort !== ISSUE_SORTING_OPTIONS.newest && sort !== ISSUE_SORTING_OPTIONS.oldest) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid sort value. Allowed: newest, oldest",
      });
    }

    if (
      typeof type === "string" &&
      type !== ISSUE_TYPE_OPTIONS.bug &&
      type !== ISSUE_TYPE_OPTIONS.feature_request
    ) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type value. Allowed: bug, feature_request",
      });
    }

    if (
      typeof status === "string" &&
      status !== ISSUE_STATUS_OPTIONS.open &&
      status !== ISSUE_STATUS_OPTIONS.in_progress &&
      status !== ISSUE_STATUS_OPTIONS.resolved
    ) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid status value. Allowed: open, in_progress, resolved",
      });
    }

    const queryOptions: {
      sort: TIssueSortingOption;
      type?: TIssueTypeOption;
      status?: TIssueStatusOption;
    } = {
      sort: sort as TIssueSortingOption,
    };

    if (typeof type === "string") {
      queryOptions.type = type as TIssueTypeOption;
    }

    if (typeof status === "string") {
      queryOptions.status = status as TIssueStatusOption;
    }

    const result = await issueService.getAllIssuesFromDB(queryOptions);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to get issues",
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

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issueService.deleteIssueFromDB(id as string);

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
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};

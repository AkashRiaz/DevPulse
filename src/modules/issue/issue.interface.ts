export const ISSUE_SORTING_OPTIONS = {
  newest: "newest",
  oldest: "oldest",
};

export type TIssueSortingOption = keyof typeof ISSUE_SORTING_OPTIONS;

export const ISSUE_TYPE_OPTIONS = {
  bug: "bug",
  feature_request: "feature_request",
};

export type TIssueTypeOption = keyof typeof ISSUE_TYPE_OPTIONS;

export const ISSUE_STATUS_OPTIONS = {
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved",
};
export type TIssueStatusOption = keyof typeof ISSUE_STATUS_OPTIONS;

export interface ICreateIssue {
  title: string;
  description: string;
  type: TIssueTypeOption;
  reporter_id: string;
}

export interface IIssue extends ICreateIssue {
  id: string;
  status: TIssueStatusOption;
  created_at: Date;
  updated_at: Date;
  reporter?: {
    id: string;
    name: string;
    role: string;
  };
}
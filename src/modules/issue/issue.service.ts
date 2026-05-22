import { pool } from "../../db";
import { USER_ROLE, type TRequester } from "../../types";
import { ISSUE_SORTING_OPTIONS, ISSUE_STATUS_OPTIONS, type ICreateIssue, type TIssueSortingOption, type TIssueStatusOption, type TIssueTypeOption } from "./issue.interface";


const createIssueIntoDB = async (payload: ICreateIssue) => {
  const { title, description, type, reporter_id } = payload;

  const result = await pool.query(
    `    
        INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4)
        returning id, title, description, type, status, reporter_id, created_at, updated_at
     `,
    [title, description, type, reporter_id],
  );

  return result;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id=$1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new Error("Issue not found with this id");
  }

  const user = result.rows[0];
  //   console.log(user);
  if (user.reporter_id) {
    const reporterData = await pool.query(
      `
      SELECT id, name, role FROM users WHERE id=$1
      `,
      [user.reporter_id],
    );

    const reporter = reporterData.rows[0];
    user.reporter = reporter;
  }

  delete user.reporter_id;

  return user;
};

const getAllIssuesFromDB = async (query: {
  sort: TIssueSortingOption;
  type?: TIssueTypeOption;
  status?: TIssueStatusOption;
}) => {
  const values: Array<string> = [];
  const whereClauses: string[] = [];
  let index = 1;

  if (query.type) {
    whereClauses.push(`type=$${index}`);
    values.push(query.type);
    index += 1;
  }

  if (query.status) {
    whereClauses.push(`status=$${index}`);
    values.push(query.status);
    index += 1;
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const sortOrder = query.sort === ISSUE_SORTING_OPTIONS.oldest ? "ASC" : "DESC";

  const result = await pool.query(
    `
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM issues
    ${where}
    ORDER BY created_at ${sortOrder}
    `,
    values,
  );

  if (result.rows.length === 0) {
    return [];
  }

  const reporterIds = [
    ...new Set(
      result.rows
        .map((issue) => issue.reporter_id)
        .filter((reporterId) => reporterId !== null),
    ),
  ];

  const reporterResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1::int[])
    `,
    [reporterIds],
  );

  const reporterMap = new Map(
    reporterResult.rows.map((reporter) => [reporter.id, reporter]),
  );

  return result.rows.map((issue) => {
    const formattedIssue = {
      ...issue,
      reporter: reporterMap.get(issue.reporter_id) || null,
    };

    delete formattedIssue.reporter_id;
    return formattedIssue;
  });
};

const updateIssueIntoDB = async (
  id: string,
  payload: Partial<ICreateIssue>,
  requester: TRequester,
) => {
  const issueResult = await pool.query(
    `
    SELECT id, reporter_id, status
    FROM issues
    WHERE id=$1
    `,
    [id],
  );

  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const issue = issueResult.rows[0];
  const isMaintainer = requester.role === USER_ROLE.maintainer;
  const isOwnerContributor =
    requester.role === USER_ROLE.contributor &&
    issue.reporter_id === requester.id &&
    issue.status === ISSUE_STATUS_OPTIONS.open;

  if (!isMaintainer && !isOwnerContributor) {
    throw new Error("Forbidden access!");
  }

  const { title, description, type } = payload;
  const result = await pool.query(
    `
    UPDATE issues SET title=COALESCE($1, title), description=COALESCE($2, description), type=COALESCE($3, type), updated_at=NOW() WHERE id=$4
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
   `,
    [title, description, type, id],
  );
  return result;
};


const deleteIssueFromDB = async (id: string) =>{
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1 RETURNING id
    `,
    [id],
  );
  return result;  
}

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

import { pool } from "../../db";
import type { TRequester } from "../../types";


const createIssueIntoDB = async (payload: any) => {
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

const updateIssueIntoDB = async (
  id: string,
  payload: any,
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
  const isMaintainer = requester.role === "maintainer";
  const isOwnerContributor =
    requester.role === "contributor" &&
    issue.reporter_id === requester.id &&
    issue.status === "open";

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
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

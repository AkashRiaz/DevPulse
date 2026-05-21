import { pool } from "../../db";

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

export const issueService = {
  createIssueIntoDB,
  getSingleIssueFromDB,
};

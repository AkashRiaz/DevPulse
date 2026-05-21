import { pool } from "../../db";

const createIssueIntoDB = async (payload: any) => {
  const { title, description, type, reporter_id } = payload;

  const result = await pool.query(`    
        INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4)
        returning id, title, description, type, status, reporter_id, created_at, updated_at
     `, [title, description, type, reporter_id]);

     return result;
};


export const issueService = {
  createIssueIntoDB,
};

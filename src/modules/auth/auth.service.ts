import bcrypt from "bcryptjs";
import type { TUser } from "../user/user.interface";
import { pool } from "../../db";
import { signToken } from "../../utils/jwt";

const signupUserIntoDB = async (payload: TUser) => {
  const { name, email, password, role } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) 
    RETURNING id, name, email, role, created_at, updated_at
    `,
    [name, email, hashedPassword, role],
  );

  return result;
};

const signinUserFromDB = async (email: string, password: string) => {
  // console.log(email, password)
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email = $1

        `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("User not found with this email");
  }


  const user = userData.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const { accessToken, refreshToken } = signToken(jwtPayload);

  delete user.password;

  return { accessToken, refreshToken, user };
};

export const authService = {
  signupUserIntoDB,
  signinUserFromDB,
};

import express from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = express.Router();

router.post(
  "/",
  auth(USER_ROLE.maintainer, USER_ROLE.contributor),
  issueController.createIssue,
);

router.get("/:id", issueController.getSingleIssue);

export const issueRoute = router;

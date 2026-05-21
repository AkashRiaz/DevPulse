import express from "express";
import { issueController } from "./issue.controller";

const router = express.Router();

router.post("/", issueController.createIssue);

export const issueRoute = router;

import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { authRoute } from "./modules/auth/auth.route";
const app: Application = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// test route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to DevPulse API",
    author: "Md Akashuzzaman Riaz",
  });
});

app.use("/api/auth", authRoute);

export default app;

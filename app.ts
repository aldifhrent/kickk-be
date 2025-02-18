import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from "express";
import cors from "cors";
import { authRouter } from "./src/routers/auth.route";
import { createRouteHandler } from "uploadthing/express";
import { organizerRouter } from "./src/routers/organizer.route";
import { eventRouter } from "@/routers/event.route";
import { dashboardRouter } from "@/routers/dashboard.route";
import { categoryRouter } from "@/routers/category.route";
import { transactionRouter } from "@/routers/transaction.route";

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(
      cors({
        origin: ["http://localhost:3000", "https://kickk-fe.vercel.app"],
        credentials: true,
      })
    );
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes("/api/v1")) {
        res.status(404).send("Not found !");
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes("/api/v1")) {
          console.error("Error : ", err.stack);
          res.status(500).send("Error !");
        } else {
          next();
        }
      }
    );
  }

  private routes(): void {
    const auth = new authRouter();
    const organizer = new organizerRouter();
    const event = new eventRouter();
    const dashboard = new dashboardRouter();
    const categories = new categoryRouter();
    const transactions = new transactionRouter();
    this.app.get("/api/v1/", (req: Request, res: Response) => {
      res.send(`Welcome to QuickEvent API V1!`);
    });
    this.app.use("/api/v1/auth", auth.getRouter());
    this.app.use("/api/v1/organizer", organizer.getRouter());
    this.app.use("/api/v1/events", event.getRouter());
    this.app.use("/api/v1/dashboard", dashboard.getRouter());
    this.app.use("/api/v1/categories", categories.getRouter());
    this.app.use("/api/v1/transactions", transactions.getRouter());
  }

  public start(): void {
    this.app.listen(process.env.PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${process.env.PORT}/`);
    });
  }

  public getApp(): Express {
    return this.app;
  }
}

import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { validateSignUp } from "../middlewares/validate";
import { verifyAuth, verifyRefreshToken } from "@/middlewares/auth.middleware";
import dashboardController from "@/controllers/dashboard.controller";

export class dashboardRouter {
  private router: Router;
  private dashboard: dashboardController;

  constructor() {
    this.dashboard = new dashboardController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", verifyAuth, this.dashboard.fetchAllEventByUser);
  }

  getRouter(): Router {
    return this.router;
  }
}

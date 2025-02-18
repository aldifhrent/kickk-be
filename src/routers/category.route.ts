import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { validateSignUp } from "../middlewares/validate";
import { verifyAuth, verifyRefreshToken } from "@/middlewares/auth.middleware";
import categoryController from "@/controllers/category.controller";

export class categoryRouter {
  private router: Router;
  private category: categoryController;

  constructor() {
    this.category = new categoryController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.category.getCategories);
  }

  getRouter(): Router {
    return this.router;
  }
}

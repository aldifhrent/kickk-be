import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { validateSignUp } from "../middlewares/validate";
import { verifyAuth, verifyRefreshToken } from "@/middlewares/auth.middleware";
import categoryController from "@/controllers/category.controller";
import transactionsController from "@/controllers/transactions.controller";

export class transactionRouter {
  private router: Router;
  private transactions: transactionsController;

  constructor() {
    this.transactions = new transactionsController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/pay", verifyAuth, this.transactions.createTransactions);
    this.router.get("/", this.transactions.getAllTransactions);
    this.router.get("/:id", verifyAuth, this.transactions.getTransactionById);
    this.router.get("/user", verifyAuth, this.transactions.updateTransactionStatus);
  }

  getRouter(): Router {
    return this.router;
  }
}

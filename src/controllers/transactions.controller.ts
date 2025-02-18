import { NextFunction, Request, response, Response } from "express";
import transactionServices from "@/services/transaction.services";

class transactionsController {
  async createTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      await transactionServices.createTransaction(req, res);
    } catch (error) {
      next(error);
    }
  }

  async getAllTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      await transactionServices.getAllTransactions(req, res);
    } catch (error) {
      next(error);
    }
  }

  async getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      await transactionServices.getTransactionStatus(req, res);
    } catch (error) {
      next(error);
    }
  }
  async updateTransactionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      await transactionServices.updateTransactionStatus(req, res);
    } catch (error) {
      next(error);
    }
  }
  async deleteTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      await transactionServices.deleteExpiredTransactions(req, res);
    } catch (error) {
      next(error);
    }
  }
}

export default transactionsController;

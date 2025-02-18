import categoryServices from "@/services/category.services";
import eventServices from "@/services/event.services";
import { NextFunction, Request, Response } from "express";

class categoryController {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryServices.getCategories(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

export default categoryController;

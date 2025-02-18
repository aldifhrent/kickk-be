import dashboardServices from "@/services/dashboard.services";
import { NextFunction, Request, Response } from "express";

class dashboardController {
  async fetchAllEventByUser(req: Request, res: Response, next: NextFunction) {
    try {
      await dashboardServices.getAllEventCreated(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

export default dashboardController;

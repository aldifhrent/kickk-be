import { NextFunction, Request, Response } from "express";

import { generateAuthToken } from "../../lib/token";
import { responseHandler } from "../helpers/res.handler";
import authServices from "../services/auth.services";
import organizerService from "@/services/organizer.services";

class organizerController {
  async getOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      await organizerService.getOrganizer(req, res, next);
    } catch (error) {
      console.log("Error during getOrganizer:", error);
      next(error);
    }
  }
  async createOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      await organizerService.createOrganizer(req, res, next);
    } catch (error) {
      console.error("Error during sign up:", error);
      next(error);
    }
  }

  async viewPublicOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      await organizerService.getPublicOrganizer(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

export default organizerController;

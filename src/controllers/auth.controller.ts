import { NextFunction, Request, response, Response } from "express";
import authServices from "../services/auth.services";
import { responseHandler } from "@/helpers/res.handler";

class AuthController {
  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authServices.signIn(req, res);
      responseHandler(res, "login success", data);
    } catch (error) {
      next(error);
    }
  }

  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      await authServices.signUp(req, res, next);
    } catch (error) {
      console.error("Error during sign up:", error);
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      await authServices.updateUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
  async changeProfile(req: Request, res: Response, next: NextFunction) {
    try {
      await authServices.changeProfile(req, res, next);
    } catch (error) {
      next(error);
    }
  }
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authServices.refreshToken(req);
      responseHandler(res, "refresh token success", data);
    } catch (error) {
      next(error);
    }
  }

  async addImageCloudinary(req: Request, res: Response, next: NextFunction) {
    try {
      await authServices.uploadAndRemoveAvatar(req);
      responseHandler(res, "upload image success");
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;

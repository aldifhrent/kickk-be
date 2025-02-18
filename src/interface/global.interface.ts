/** @format */

import { Multer } from "multer";
import { UserLogin } from "./auth.interface";
import * as express from 'express';

// Memperluas interface Request untuk mengenali user dan file
declare global {
  namespace Express {
    interface Request {
      user: UserLogin;
      file?: Express.Multer.File;
    }
  }
}

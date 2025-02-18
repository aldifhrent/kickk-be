import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { validateSignUp } from "../middlewares/validate";
import { verifyAuth, verifyRefreshToken } from "@/middlewares/auth.middleware";
import { uploader } from "@/helpers/multer";
import authController from "../controllers/auth.controller";

export class authRouter {
  private router: Router;
  private auth: AuthController;

  constructor() {
    this.auth = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/new", this.auth.signUp);
    this.router.post("/", this.auth.signIn);

    this.router.post("/token", verifyRefreshToken, this.auth.refreshToken);
    this.router.patch("/profile", verifyAuth, this.auth.changeProfile);
    this.router.post(
      "/profile/image",
      verifyAuth,
      uploader().single("image"),
      this.auth.addImageCloudinary
    );
  }

  getRouter(): Router {
    return this.router;
  }
}

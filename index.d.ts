import { UserLogin } from "./src/interface/auth.interface";

declare global {
  namespace Express {
    interface Request {
      user: UserLogin;
    }
  }
}

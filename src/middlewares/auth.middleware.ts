import { Request, Response, NextFunction } from "express";
import { UserLogin } from "@/interface/auth.interface";
import { verify } from "jsonwebtoken";

export const verifyAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authorization = req.headers.authorization?.toString();

    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(403).json({
        message: "Invalid authorization",
      });
      return;
    }

    // Extract token from authorization header
    const token = authorization.split("Bearer ")[1];

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "Internal Server Error: JWT_SECRET is not set in environment variables"
      );
      // return res.status(500).json({
      //   message:
      //     "Internal Server Error: JWT_SECRET is not set in environment variables",
      // });
    }

    // Verify the token
    const verifyUser = verify(token, process.env.JWT_SECRET!) as UserLogin;

    req.user = verifyUser; // Assign verified user to request object

    next(); // Continue to the next middleware
  } catch (error) {
    console.error(error);

    // Handling error based on the type of error
    if (error instanceof Error && error.message === "jwt expired") {
      throw new Error("Unauthorized: Token expired");
    }

    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export const verifyRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    const token = String(authorization).split("Bearer ")[1];
    const verifiedUser = verify(token, process.env.REFRESH_JWT_SECRET!);

    req.user = verifiedUser as UserLogin;
    next();
  } catch (error) {
    next(error);
  }
};

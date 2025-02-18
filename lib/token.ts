import { sign } from "jsonwebtoken";
import { findByEmail } from "../sql/user";
import { UserLogin } from "../src/interface/auth.interface";

export const generateAuthToken = async (user?: UserLogin, email?: string) => {
  const existingUser = user || ((await findByEmail(email!)) as UserLogin);
  if (!existingUser) throw new Error("wrong email");

  const access_token = sign(existingUser, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  const refresh_token = sign(
    { email: existingUser.email },
    process.env.REFRESH_JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );
  return { access_token, refresh_token };
};

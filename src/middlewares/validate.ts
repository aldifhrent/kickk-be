import * as z from "zod";
import { Request, Response, NextFunction } from "express";

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Nama minimal 3 karakter" })
      .max(50, { message: "Nama maksimal 50 karakter" }),

    email: z.string().email({ message: "Email tidak valid" }),

    password: z
      .string()
      .min(6, { message: "Password minimal 6 karakter" })
      .regex(/[A-Z]/, { message: "Harus ada huruf besar" })
      .regex(/[a-z]/, { message: "Harus ada huruf kecil" })
      .regex(/\d/, { message: "Harus ada angka" }),

    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan Konfirmasi Password harus sama",
    path: ["confirmPassword"],
  });

const validate =
  (schema: z.ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(203).send({
          message: error.message,
        });
      }
    }
  };

export const validateSignUp = validate(signUpSchema);

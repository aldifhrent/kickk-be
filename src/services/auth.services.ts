/** @format */

import { NextFunction, Request, Response } from "express";
import { findByEmail } from "../../sql/user";
import { generateAuthToken } from "../../lib/token";
import { CodeGenerator } from "../../lib/ref";
import { prisma } from "../../lib/prisma";
import { UserLogin } from "@/interface/auth.interface";
import { ErrorHandler } from "@/helpers/err.handler";
import * as bcrypt from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { cloudinaryUpload, extractPublicFromURL } from "@/helpers/cloudinary";
import { v2 as cloudinary } from "cloudinary";

class AuthService {
  async signIn(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = (await findByEmail(email)) as UserLogin;
    if (!user)
      throw new ErrorHandler(
        "The email that you've entered is incorrect.",
        401
      );
    else if (!(await bcrypt.compare(password, user.password as string)))
      return res.status(403).send({
        message: "The password that you've entered is incorrect.",
      });

    return await generateAuthToken(user);
  }

  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, referralCode } = req.body;

      // Cek apakah email sudah terdaftar
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // Hash password sebelum menyimpan
      const passwordHash = await bcrypt.hash(password, 12);

      // Generate kode referral unik untuk user baru
      let newReferralCode;
      do {
        newReferralCode = CodeGenerator.generateCode({ length: 6 });
      } while (
        await prisma.user.findUnique({
          where: { referralCode: newReferralCode },
        })
      );

      // Mulai transaksi database
      const newUser = await prisma.$transaction(async (tx: any) => {
        // Buat user baru
        const createdUser = await tx.user.create({
          data: {
            name,
            email,
            password: passwordHash,
            role: "CUSTOMER",
            imageUrl: null,
            pointsBalance: 0,
            referralCode: newReferralCode,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            imageUrl: true,
            pointsBalance: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // Jika user mendaftar dengan referral code
        if (referralCode) {
          const referrer = await tx.user.findUnique({
            where: { referralCode },
            select: { id: true, pointsBalance: true },
          });

          if (!referrer) {
            throw new Error("Kode referral tidak valid");
          }

          // Perbarui `referrerId` di user yang baru daftar
          await tx.user.update({
            where: { id: createdUser.id },
            data: { referrerId: referrer.id },
          });

          // Tambahkan poin ke user yang mereferensikan
          await tx.user.update({
            where: { id: referrer.id },
            data: { pointsBalance: { increment: 10000 } },
          });
        }

        return createdUser; // Pastikan hanya `createdUser` yang dikembalikan
      });

      // Return response sukses
      return res.status(201).json({
        message: "User berhasil dibuat",
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          imageUrl: newUser.imageUrl,
          referralCode: newReferralCode,
          pointsBalance: newUser.pointsBalance,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      });
    } catch (error) {
      console.error("Error saat sign up:", error);

      if (res.headersSent) {
        return;
      }

      if (error instanceof Error && error.message.includes("Kode referral")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    const { name } = req.body;
    const id = String(req.user.id);

    await prisma.user.update({
      data: {
        name,
      },
      where: {
        id,
      },
    });
    const token = await this.refreshToken(req);
    return res.status(200).json({
      success: true,
      message: " Update user successfully",
      token,
    });
  }

  async refreshToken(req: Request) {
    if (!req.user?.email) throw new Error("invalid token");

    return await generateAuthToken(undefined, req.user?.email);
  }

  async changeProfile(req: Request, res: Response, next: NextFunction) {
    const id = String(req.user.id);

    const { name, password } = req.body;

    // Pastikan setidaknya ada satu field yang dikirimkan (name atau password)
    if (!name && !password) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or password) must be provided",
      });
    }

    const updateData: { name?: string; password?: string } = {};

    // Jika password disediakan, hash dan update
    if (password) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    // Jika name disediakan, tambahkan ke data yang akan di-update
    if (name) {
      updateData.name = name;
    }

    try {
      // Cek apakah user ada sebelum melakukan update
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      // Lakukan update hanya pada data yang ada di updateData
      await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json({
        success: true,
        message: "Successfully changed profile data",
      });
    } catch (error) {
      console.error("Database update error:", error);

      // Tangani error Prisma secara spesifik
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Tangani error umum lainnya
        return res.status(500).json({
          success: false,
          message: "Failed to update profile",
          error: error.message,
        });
      }

      // Tangani error umum
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  async uploadAndRemoveAvatar(req: Request) {
    const id = String(req.user.id);
    const { file } = req;

    if (!file) {
      throw new Error("No File Uploaded");
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (user?.imageUrl) {
        const publicId = extractPublicFromURL(user.imageUrl);
        await cloudinary.uploader.destroy(publicId);
      }

      const { secure_url } = await cloudinaryUpload({
        file,
        userId: id,
        folder: "profile",
      });

      // Update URL gambar ke database
      await prisma.user.update({
        data: {
          imageUrl: secure_url,
        },
        where: {
          id,
        },
      });

      return secure_url; // Kembalikan URL gambar yang diupload
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw new Error("Failed to upload avatar");
    }
  }
}

export default new AuthService();

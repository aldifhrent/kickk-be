import slugify from "slugify";
import { Request, Response, NextFunction } from "express";
import { prisma } from "lib/prisma";
import { cloudinaryUpload, extractPublicFromURL } from "@/helpers/cloudinary";
import "../interface/global.interface";

class OrganizerController {
  async getOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;

      const organizer = await prisma.organizer.findUnique({
        where: {
          userId: userId,
        },
      });

      if (!organizer) {
        return res.status(404).send({
          success: false,
          message: "Organizer not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Organizer found successfully",
        data: organizer,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async createOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String(req.user.id);

      // Validasi apakah userId ada
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Cek apakah user sudah memiliki organizerId
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(400).json({ message: "User not found" });
      }

      if (existingUser.organizerId) {
        return res
          .status(400)
          .json({ message: "User already has an organizer" });
      }

      const { organizerName, aboutOrganizer, website } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      // Mengupload logo ke Cloudinary
      const { secure_url } = await cloudinaryUpload({
        file: Buffer.from(file.buffer),
        folder: "organizer",
      });

      const existingOrganizerName = await prisma.organizer.findUnique({
        where: { organizerName },
      });

      if (existingOrganizerName) {
        return res
          .status(400)
          .json({ message: "Organizer name already exists" });
      }

      const slug = slugify(organizerName, { lower: true, strict: true });

      // Membuat organizer baru dengan logo
      const organizer = await prisma.organizer.create({
        data: {
          organizerName,
          aboutOrganizer,
          website,
          logoUrl: secure_url,
          userId,
          slug: slug
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              imageUrl: true,
            },
          },
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { organizerId: organizer.id },
      });

      res.status(201).json({
        message: "Organizer created successfully",
        data: organizer,
      });
    } catch (error) {
      console.error("Error creating organizer:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
      next(error);
    }
  }

  async getPublicOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Mencari organizer berdasarkan slug
      const organizer = await prisma.organizer.findUnique({
        where: {
          id: id,
        },
        include: { Review: true, Events: true },
      });

      if (!organizer) {
        return res.status(404).send({
          success: false,
          message: "Organizer not found",
        });
      }

      const totalEvents = organizer.Events.length;
      return res.status(200).json({
        success: true,
        message: "Organizer found successfully",
        data: { ...organizer, totalEvents },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async uploadLogo(req: Request, res: Response, next: NextFunction) {
    const { file } = req;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    try {
      const { secure_url } = await cloudinaryUpload({
        file,
        folder: "organizer",
      });

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        url: secure_url // Kembalikan URL gambar yang diunggah
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      return res.status(500).json({
        success: false,
        message: "Error uploading logo",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}

export default new OrganizerController();

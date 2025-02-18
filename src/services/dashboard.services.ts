import { Request, Response, NextFunction } from "express";
import organizerService from "@/services/organizer.services"; // Import the service to handle the creation logic
import { prisma } from "lib/prisma";

class dashboardServices {
  async getAllEventCreated(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = req.user.organizerId;
      // Cari organizer berdasarkan userId dan sertakan event yang terkait
      const organizer = await prisma.organizer.findUnique({
        where: {
          id: organizerId,
        },
        include: {
          Events: true, // Ambil semua event yang dibuat oleh organizer ini
        },
      });

      if (!organizer) {
        return res.status(404).json({
          success: false,
          message: "Organizer not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Fetched all events created by the organizer",
        data: {
          events: organizer.Events, // Ambil semua event yang telah dibuat oleh organizer ini
        },
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

export default new dashboardServices();

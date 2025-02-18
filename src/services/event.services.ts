import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import slugify from "slugify";
import { Prisma } from "@prisma/client";
import { findEventBySlug, findNewEvents, findUpcomingEvent } from "sql/events";
import { slugGenerator } from "@/helpers/slug";

class eventServices {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.query;
      let events;

      if (type === "upcoming") {
        events = await findUpcomingEvent();
      } else if (type === "new") {
        events = await findNewEvents();
      } else {
        events = await prisma.events.findMany({
          include: {
            organizer: {
              select: {
                organizerName: true,
              },
            },
            Category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Successfully retrieved events",
        data: events,
      });
    } catch (error) {
      console.error(error);
      next(error); // Let the error be handled by the global error handler
    }
  }
  async getAllEventsByORG(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = req.user.organizerId;

      // Throw an error if organizerId is not present
      if (!organizerId) {
        throw new Error("Organizer ID is required.");
      }

      // Fetch events related to the organizerId
      const events = await prisma.events.findMany({
        where: {
          organizerId: organizerId, // Ensure you're fetching events by organizerId
        },
        include: {
          Category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Successfully retrieved events",
        data: events,
      });
    } catch (error) {
      console.error(error);
      next(error); // Let the error be handled by the global error handler
    }
  }

  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.id);
      const event = await findEventBySlug(slug);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Successfully retrieved event",
        data: event,
      });
    } catch (error) {
      console.error(error);
      next(error); // Let the error be handled by the global error handler
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      // Pastikan user memiliki organizerId
      if (!req.user || !req.user.organizerId) {
        return res.status(401).json({
          message: "Unauthorized: Organizer ID is required",
        });
      }

      const organizerId = String(req.user.organizerId);

      // Cek apakah organizer ada
      const organizer = await prisma.organizer.findUnique({
        where: { id: organizerId },
      });

      if (!organizer) {
        return res.status(400).json({ message: "Invalid Organizer ID" });
      }

      // Ambil data dari request body
      const {
        title,
        description,
        imageUrl,
        registrationStartDate,
        registrationEndDate,
        eventStartDate,
        eventEndDate,
        price,
        attendedEvent,
        ticketType,
        totalTicket,
        categoryIds,
      } = req.body;

      // Validasi kategori
      const categories = await prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
      });

      // Membuat event baru dan menghubungkannya dengan kategori
      const event = await prisma.events.create({
        data: {
          title,
          slug: slugify(title),
          description,
          imageUrl,
          registrationStartDate,
          registrationEndDate,
          eventStartDate,
          eventEndDate,
          price,
          attendedEvent,
          ticketType,
          totalTicket,
          organizer: {
            connect: {
              id: organizerId,
            },
          },
          Category: {
            connect: categories.map((category) => ({ id: category.id })),
          },
        },
      });

      return res.status(201).json({
        message: "Event created successfully",
        data: event,
      });
    } catch (error) {
      console.error("Error creating event:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res
          .status(400)
          .json({ message: "Database error: " + error.message });
      }

      next(error);
    }
  }
}

export default new eventServices();

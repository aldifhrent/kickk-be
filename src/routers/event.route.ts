import { Router } from "express";
import { verifyAuth } from "@/middlewares/auth.middleware";
import eventController from "@/controllers/event.controller";

export class eventRouter {
  private router: Router;
  private event: eventController;

  constructor() {
    this.event = new eventController();
    this.router = Router();
    this.initializeRoutes();
  }

  // Create Organizer, Get Organization by id
  private initializeRoutes(): void {
    this.router.get("/", this.event.getAllEvents);
    this.router.get("/byorg", verifyAuth, this.event.getAllEventsByOrganizer);
    this.router.post("/", verifyAuth, this.event.createEvent);
    this.router.get("/:id", this.event.getEvent);
  }

  getRouter(): Router {
    return this.router;
  }
}

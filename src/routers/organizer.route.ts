import { Router } from "express";
import organizerController from "../controllers/organizer.controller";
import { verifyAuth } from "@/middlewares/auth.middleware";

export class organizerRouter {
  private router: Router;
  private organizer: organizerController;

  constructor() {
    this.organizer = new organizerController();
    this.router = Router();
    this.initializeRoutes();
  }

  // Create Organizer, Get Organization by id
  private initializeRoutes(): void {
    this.router.post("/new", verifyAuth, this.organizer.createOrganizer); // Create new organizer
    this.router.get("/", verifyAuth, this.organizer.getOrganizer); // Get organizer by user (authenticated)
    this.router.get("/:id", this.organizer.viewPublicOrganizer);
  }

  getRouter(): Router {
    return this.router;
  }
}

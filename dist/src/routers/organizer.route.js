"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizerRouter = void 0;
const express_1 = require("express");
const organizer_controller_1 = __importDefault(require("@/controllers/organizer.controller"));
class organizerRouter {
    constructor() {
        this.organizer = new organizer_controller_1.default();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    // Create Organizer, Get Organization by id
    initializeRoutes() {
        this.router.post("/create", this.organizer.createOrganizer);
        this.router.get("/:id", this.organizer.getOrganizer);
    }
    getRouter() {
        return this.router;
    }
}
exports.organizerRouter = organizerRouter;

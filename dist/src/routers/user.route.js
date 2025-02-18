"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = __importDefault(require("@/controllers/user.controller"));
class userRouter {
    constructor() {
        this.user = new user_controller_1.default();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/:id", this.user.getUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.userRouter = userRouter;

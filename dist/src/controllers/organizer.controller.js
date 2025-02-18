"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("lib/prisma");
class organizerController {
    getOrganizer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const organizer = yield prisma_1.prisma.organizer.findUnique({
                    where: {
                        userId: id,
                    },
                });
                if (!organizer) {
                    res.status(404).send({
                        message: "Organizer not found",
                    });
                }
                res.status(200).json({
                    message: "Fetch Organizer",
                    organizer,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Creates a new organizer account for the current user.
     * @param {Request} req - The request object containing the user's id and the organizer data.
     * @param {Response} res - The response object to send the API response.
     * @param {NextFunction} next - The next middleware function in the stack.
     * @returns {Promise<void>} - A promise that resolves when the request has been handled.
     */
    createOrganizer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { companyName, description, website } = req.body;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                // Check if the user already has an organizer account
                const existingOrganizer = yield prisma_1.prisma.organizer.findUnique({
                    where: { userId },
                });
                if (existingOrganizer) {
                    res.status(400).json({
                        message: "User already has an organizer account",
                    });
                    return;
                }
                // Check if the user exists
                const user = yield prisma_1.prisma.user.findUnique({
                    where: { id: userId },
                });
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                // Create the organizer with type-safe data
                const organizer = yield prisma_1.prisma.organizer.create({
                    data: {
                        userId: userId, // Now userId is guaranteed to be string
                        companyName: companyName,
                        description: description || null, // Handle optional fields
                        website: website || null,
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
                res.status(201).json({
                    message: "Organizer created successfully",
                    data: organizer,
                });
            }
            catch (error) {
                console.error("Create organizer error:", error);
                next(error);
            }
        });
    }
}
exports.default = organizerController;

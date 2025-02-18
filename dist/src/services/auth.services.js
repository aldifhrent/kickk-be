"use strict";
/** @format */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const bcrypt = __importStar(require("bcrypt"));
const user_1 = require("sql/user");
const token_1 = require("lib/token");
const ref_1 = require("lib/ref");
const prisma_1 = require("lib/prisma");
class AuthService {
    signIn(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield (0, user_1.findByEmail)(email);
                if (!user) {
                    throw new Error("User not found");
                }
                const isValid = yield bcrypt.compare(password, user.password);
                if (!isValid) {
                    res.status(403).json({
                        message: "Invalid Email or password",
                    });
                }
                return yield (0, token_1.generateAuthToken)(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    signUp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, referralCode } = req.body;
                const existingUser = yield (0, user_1.findByEmail)(email);
                if (existingUser) {
                    throw new Error("User already exists");
                }
                const passwordHash = yield bcrypt.hash(password, 12);
                let refGenerate = ref_1.CodeGenerator.generateCode({ length: 6 });
                let isRefValid = yield prisma_1.prisma.user.findFirst({
                    where: { referralCode: refGenerate },
                });
                while (isRefValid) {
                    isRefValid = yield prisma_1.prisma.user.findFirst({
                        where: { referralCode: refGenerate },
                    });
                }
                let referredByUser = null;
                if (referralCode) {
                    referredByUser = yield prisma_1.prisma.user.findFirst({
                        where: { referralCode },
                    });
                    if (!referredByUser) {
                        throw new Error("Not Found");
                    }
                }
                const newUser = yield prisma_1.prisma.user.create({
                    data: {
                        name,
                        email,
                        password: passwordHash,
                        role: "CUSTOMER",
                        referralCode: refGenerate,
                        referredById: referredByUser ? referredByUser.id : null,
                        imageUrl: "",
                        pointsBalance: 0,
                    },
                });
                if (referredByUser) {
                    yield prisma_1.prisma.user.update({
                        where: { id: referredByUser.id },
                        data: {
                            pointsBalance: { increment: 10000 },
                        },
                    });
                }
                res.status(201).json({
                    message: "User created successfully",
                    data: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        imageUrl: newUser.imageUrl ? newUser.imageUrl : null,
                        refCode: newUser.referralCode,
                        referredById: referredByUser ? referredByUser.email : null,
                        pointsBalance: newUser.pointsBalance,
                        createdAt: newUser.createdAt,
                        updatedAt: newUser.updatedAt,
                    },
                });
            }
            catch (error) {
                console.error("Error during sign up:", error);
                next(error);
            }
        });
    }
}
exports.default = new AuthService();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const zod_1 = __importDefault(require("zod"));
const envSchema = zod_1.default.object({
    PORT: zod_1.default.number(),
    NODE_ENV: zod_1.default.enum(["development", "production"]).default("development"),
    DATABASE_URL: zod_1.default.string().optional(),
    JWT_SECRET: zod_1.default.string().optional(),
});
const rawPort = process.env.PORT ? Number(process.env.PORT) : NaN;
const envServer = envSchema.safeParse({
    PORT: isNaN(rawPort) ? 9000 : rawPort,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
});
if (!envServer.success) {
    console.error(envServer.error.issues);
    throw new Error("There is an error with the server environment variables");
    process.exit(1);
}
exports.validateEnv = envServer.data;

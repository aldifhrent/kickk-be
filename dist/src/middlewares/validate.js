"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignUp = exports.signUpSchema = void 0;
const z = __importStar(require("zod"));
exports.signUpSchema = z
    .object({
    name: z
        .string()
        .min(3, { message: "Nama minimal 3 karakter" })
        .max(50, { message: "Nama maksimal 50 karakter" }),
    email: z.string().email({ message: "Email tidak valid" }),
    password: z
        .string()
        .min(6, { message: "Password minimal 6 karakter" })
        .regex(/[A-Z]/, { message: "Harus ada huruf besar" })
        .regex(/[a-z]/, { message: "Harus ada huruf kecil" })
        .regex(/\d/, { message: "Harus ada angka" }),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan Konfirmasi Password harus sama",
    path: ["confirmPassword"],
});
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(203).send({
                message: error.message,
            });
        }
    }
};
exports.validateSignUp = validate(exports.signUpSchema);

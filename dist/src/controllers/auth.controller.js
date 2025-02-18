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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("lib/token");
const auth_services_1 = __importDefault(require("@/services/auth.services"));
const res_handler_1 = require("@/helpers/res.handler");
class AuthController {
    signIn(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield auth_services_1.default.signIn(req, res, next);
                (0, res_handler_1.responseHandler)(res, "login success", data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    signUp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield auth_services_1.default.signUp(req, res, next);
                (0, res_handler_1.responseHandler)(res, "register success");
            }
            catch (error) {
                console.error("Error during sign up:", error);
                next(error);
            }
        });
    }
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.email))
                    throw new Error("invalid token");
                yield (0, token_1.generateAuthToken)(undefined, (_b = req.user) === null || _b === void 0 ? void 0 : _b.email);
                res.status(200).send({
                    message: "Access granted",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = AuthController;

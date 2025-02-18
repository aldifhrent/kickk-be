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
exports.generateAuthToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("sql/user");
const generateAuthToken = (user, email) => __awaiter(void 0, void 0, void 0, function* () {
    const existUser = user || (yield (0, user_1.findByEmail)(email));
    if (!existUser)
        throw new Error("wrong email");
    const access_token = (0, jsonwebtoken_1.sign)(existUser, process.env.JWT_SECRET, {
        expiresIn: "20m",
    });
    const refresh_token = (0, jsonwebtoken_1.sign)({ email: existUser.email }, process.env.REFRESH_JWT_SECRET, {
        expiresIn: "1h",
    });
    return { access_token, refresh_token };
});
exports.generateAuthToken = generateAuthToken;

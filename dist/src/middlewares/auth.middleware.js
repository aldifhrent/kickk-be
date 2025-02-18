"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const verifyRefreshToken = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const token = String(authorization || "").split("Bearer ")[1];
        const verifiedUser = (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_JWT_SECRET);
        req.user = verifiedUser;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyRefreshToken = verifyRefreshToken;

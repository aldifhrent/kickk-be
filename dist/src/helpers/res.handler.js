"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
const responseHandler = (res, message, data, code) => {
    return res.status(code || 200).send({
        message,
        data,
    });
};
exports.responseHandler = responseHandler;

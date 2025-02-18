"use strict";
/** @format */
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
const response_handler_1 = require("../helpers/response.handler");
const cart_service_1 = __importDefault(require("../services/cart.service"));
class CartController {
    addToCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cart_service_1.default.addToCart(req);
                (0, response_handler_1.responseHandler)(res, "new product has been added to cart", undefined, 201);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield cart_service_1.default.getUserCart(req);
                (0, response_handler_1.responseHandler)(res, "fetching cart", data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cart_service_1.default.deleteCart(req);
                (0, response_handler_1.responseHandler)(res, "product has been deleted from your cart");
            }
            catch (error) {
                next(error);
            }
        });
    }
    checkout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = yield cart_service_1.default.checkout(req);
                (0, response_handler_1.responseHandler)(res, "your transaction has been created, please proceed your payment through midtrans", token);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updatePayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield cart_service_1.default.updatePaymentStatus(req);
                (0, response_handler_1.responseHandler)(res, "your payment status has been updated");
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = new CartController();

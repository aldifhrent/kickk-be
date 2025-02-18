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
const config_1 = require("../config");
const response_handler_1 = require("../helpers/response.handler");
class CartService {
    addToCart(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { product_id } = req.body;
            const checkIfProductExist = yield config_1.prisma.cart.findFirst({
                where: {
                    userId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id),
                    productId: Number(product_id),
                },
            });
            if (checkIfProductExist)
                throw new response_handler_1.ErrorHandler("This product is already in your cart");
            const data = {
                Product: {
                    connect: {
                        id: product_id,
                    },
                },
                User: {
                    connect: {
                        id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                    },
                },
            };
            yield config_1.prisma.cart.create({
                data,
            });
        });
    }
    getUserCart(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return yield config_1.prisma.cart.findMany({
                select: {
                    Product: {
                        select: {
                            id: true,
                            img_src: true,
                            product_name: true,
                            price: true,
                            slug: true,
                        },
                    },
                },
                where: {
                    userId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id),
                },
            });
        });
    }
    deleteCart(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return yield config_1.prisma.cart.delete({
                where: {
                    productId_userId: {
                        productId: Number(req.params.productId),
                        userId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id),
                    },
                },
            });
        });
    }
    checkout(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield config_1.prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const carts = yield prisma.cart.findMany({
                    include: {
                        Product: true,
                    },
                    where: {
                        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    },
                }); //check existing cart
                if (carts.length == 0)
                    throw new response_handler_1.ErrorHandler("Your Cart is Empty");
                //create data for transaction & transaction details
                const data = {
                    noInvoice: "INV" + new Date().valueOf(),
                    User: {
                        connect: {
                            id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                        },
                    },
                    TransactionDetail: {
                        createMany: {
                            data: carts.map(({ productId, Product }) => ({
                                productId,
                                price: Product.price,
                            })),
                        },
                    },
                };
                const { id } = yield prisma.transaction.create({
                    data,
                }); //create transaction & transaction details
                const transactions = yield prisma.transaction.findUnique({
                    include: {
                        TransactionDetail: true,
                    },
                    where: {
                        id,
                    },
                });
                //create parameter for midtrans transaction
                let parameter = {
                    transaction_details: {
                        order_id: transactions === null || transactions === void 0 ? void 0 : transactions.noInvoice,
                        gross_amount: transactions === null || transactions === void 0 ? void 0 : transactions.TransactionDetail.reduce((sum, { price }) => sum + Number(price), 0),
                    },
                };
                const { token, redirect_url } = yield config_1.snap.createTransaction(parameter); // create transaction in midtrans
                yield prisma.cart.deleteMany({
                    where: {
                        userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                    },
                });
                return token;
            }));
        });
    }
    updatePaymentStatus(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const res = yield fetch(`https://api.sandbox.midtrans.com/v2/${req.params.no_inv}/status`, {
                headers: {
                    Authorization: "Basic " +
                        Buffer.from(config_1.midtrans_server_key + ":").toString("base64"),
                },
            });
            const { transaction_status } = yield res.json();
            if (transaction_status == "settlement")
                yield config_1.prisma.transaction.update({
                    data: {
                        status: "PAID",
                    },
                    where: {
                        noInvoice: String(req.params.no_inv),
                        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    },
                });
            else
                throw new response_handler_1.ErrorHandler("Please finish your transaction payment");
        });
    }
}
exports.default = new CartService();

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = require("./src/routers/auth.route");
const validateEnv_1 = require("./lib/validateEnv");
const upload_route_1 = require("@/routers/upload.route");
const express_2 = require("uploadthing/express");
const organizer_route_1 = require("@/routers/organizer.route");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.routes();
        this.handleError();
    }
    configure() {
        this.app.use((0, cors_1.default)({
            origin: "http://localhost:3000",
            credentials: true,
        }));
        this.app.use((0, express_1.json)());
        this.app.use((0, express_1.urlencoded)({ extended: true }));
    }
    handleError() {
        // not found
        this.app.use((req, res, next) => {
            if (req.path.includes("/api/v1")) {
                res.status(404).send("Not found !");
            }
            else {
                next();
            }
        });
        // error
        this.app.use((err, req, res, next) => {
            if (req.path.includes("/api/v1")) {
                console.error("Error : ", err.stack);
                res.status(500).send("Error !");
            }
            else {
                next();
            }
        });
    }
    routes() {
        const auth = new auth_route_1.authRouter();
        const organizer = new organizer_route_1.organizerRouter();
        this.app.get("/api/v1/", (req, res) => {
            res.send(`Hello, welcome to QuickEvent API!`);
        });
        this.app.use("/api/v1/auth", auth.getRouter());
        this.app.use("/api/v1/auth/organizer", organizer.getRouter());
        this.app.use("/api/v1/upload", (0, express_2.createRouteHandler)({
            router: upload_route_1.uploadRouter,
        }));
    }
    start() {
        this.app.listen(validateEnv_1.validateEnv.PORT, () => {
            console.log(`  ➜  [API] Local:   http://localhost:${validateEnv_1.validateEnv.PORT}/`);
        });
    }
}
exports.default = App;

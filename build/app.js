"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
// import users from "./module/v1/users/users.routes";
// import products from "./module/v1/products/products.routes";
// import excel from "./module/v1/excel/excel.routes";
// import questions from "./module/v1/question/question.routes";
// import partner from "./module/v1/partners/partners.routes";
// import suggestions from "./module/v1/suggestions/suggestions.routes";
// import message from "./module/v1/messages/messages.routes";
// import appointment from "./module/v1/appointment/appointment.routes";
const index_1 = __importDefault(require("./module/v1/index"));
const index_2 = __importDefault(require("./module/v2/index"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://192.168.30.102:3000",
        "http://192.168.30.102:*",
        "http://localhost:3000",
        "http://localhost:3003",
        "http://localhost:3001",
        "http://localhost:*",
        "http://192.168.30.102:3000",
        "http://192.168.30.102:3001",
        "http://192.168.30.102:3003",
        "http://192.168.40.47:3004",
        "http://192.168.30.102:*",
        "http://localhost:3002",
        "http://192.168.40.10:4000",
        "http://localhost:3001",
        "http://192.168.4.30:3001",
        "http://192.168.4.30:3003",
        "https://landing-page-iota-eight-94.vercel.app",
        "file:///D:/z-bbs/tdhaemoi-backend/public/index.html",
        "https://landing-page-iota-eight-94.vercel.app",
        "http://localhost:3002",
        "https://tdhaemoi-partner-dashbaord.vercel.app",
        "https://feetf1rst.tech",
        "https://partner.feetf1rst.tech",
    ],
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use("/assets", express_1.default.static(path_1.default.join(__dirname, "../assets")));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.use("/", index_1.default);
app.use("/v2", index_2.default);
app.use((req, res, next) => {
    res.status(404).json({
        message: `404 route not found`,
    });
});
app.use((err, req, res, next) => {
    res.status(500).json({
        message: `500 Something broken!`,
        error: err.message,
    });
});
// Make sure this line is before your routes
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
exports.default = app;
//# sourceMappingURL=app.js.map
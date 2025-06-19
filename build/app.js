"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const users_routes_1 = __importDefault(require("./module/users/users.routes"));
const products_routes_1 = __importDefault(require("./module/products/products.routes"));
const excel_routes_1 = __importDefault(require("./module/excel/excel.routes"));
const question_routes_1 = __importDefault(require("./module/question/question.routes"));
const partners_routes_1 = __importDefault(require("./module/partners/partners.routes"));
const suggestions_routes_1 = __importDefault(require("./module/suggestions/suggestions.routes"));
const messages_routes_1 = __importDefault(require("./module/messages/messages.routes"));
const appointment_routes_1 = __importDefault(require("./module/appointment/appointment.routes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://192.168.30.102:3000",
        "http://192.168.30.102:*",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:*",
        'http://192.168.30.102:3000',
        "http://192.168.30.102:3001",
        "http://192.168.30.102:3003",
        "http://192.168.40.47:3004",
        "http://192.168.30.102:*",
        "http://localhost:3002",
        "http://192.168.40.10:4000",
        "http://localhost:3001",
        "http://192.168.4.30:3001",
        "https://landing-page-iota-eight-94.vercel.app",
        "file:///D:/z-bbs/tdhaemoi-backend/public/index.html",
        'https://landing-page-iota-eight-94.vercel.app',
        'http://localhost:3002'
    ],
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use("/users", users_routes_1.default);
app.use("/products", products_routes_1.default); // Add this line
app.use("/excel", excel_routes_1.default);
app.use("/questions", question_routes_1.default);
app.use("/partner", partners_routes_1.default);
app.use("/suggestions", suggestions_routes_1.default);
app.use("/message", messages_routes_1.default);
app.use("/appointment", appointment_routes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, 'assets')));
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
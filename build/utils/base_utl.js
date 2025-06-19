"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseUrl = exports.getImageUrl = void 0;
const getImageUrl = (imagePath) => {
    return `${process.env.APP_URL}${imagePath}`;
};
exports.getImageUrl = getImageUrl;
exports.baseUrl = process.env.APP_URL;
//# sourceMappingURL=base_utl.js.map
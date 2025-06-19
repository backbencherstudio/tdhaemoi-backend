"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationResult = exports.getPaginationOptions = void 0;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const getPaginationOptions = (req) => {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    return { page, limit };
};
exports.getPaginationOptions = getPaginationOptions;
const getPaginationResult = (data, total, options) => {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = options;
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
        },
    };
};
exports.getPaginationResult = getPaginationResult;
//# sourceMappingURL=pagination.js.map
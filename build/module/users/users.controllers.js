"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuthStatus = exports.getAllPartners = exports.updatePartnerProfile = exports.createPartnership = exports.changePassword = exports.updateUser = exports.loginUser = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const base_utl_1 = require("../../utils/base_utl");
const emailService_utils_1 = require("../../utils/emailService.utils");
const prisma = new client_1.PrismaClient();
// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password } = req.body;
//     const image = req.file;
//     const missingField = ["name", "email", "password"].find(
//       (field) => !req.body[field]
//     );
//     if (missingField) {
//       res.status(400).json({
//         message: `${missingField} is required!`,
//       });
//     }
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });
//     if (existingUser) {
//       if (image) {
//         fs.unlinkSync(path.join(__dirname, "../../uploads", image.filename));
//       }
//       res.status(400).json({
//         message: "Email already exists",
//       });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         image: image ? image.filename : null,
//       },
//     });
//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET as string,
//       { expiresIn: "100d" }
//     );
//     const imageUrl = user.image ? getImageUrl(`/uploads/${user.image}`) : null;
//     res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         image: imageUrl,
//       },
//     });
//   } catch (error) {
//     if (req.file) {
//       fs.unlinkSync(path.join(__dirname, "../../uploads", req.file.filename));
//     }
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//       error,
//     });
//   }
// };
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const image = req.file;
        const missingField = ["name", "email", "password"].find((field) => !req.body[field]);
        if (missingField) {
            if (image) {
                const imagePath = path_1.default.join(__dirname, "../../uploads", image.filename);
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            res.status(400).json({
                message: `${missingField} is required!`,
            });
            return;
        }
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            if (image) {
                const imagePath = path_1.default.join(__dirname, "../../uploads", image.filename);
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            res.status(400).json({
                message: "Email already exists",
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: image ? image.filename : null,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "100d" });
        const imageUrl = user.image ? (0, base_utl_1.getImageUrl)(`/uploads/${user.image}`) : null;
        res.status(201).json({
            success: true,
            message: "User created successfully",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: imageUrl,
            },
        });
    }
    catch (error) {
        if (req.file) {
            const imagePath = path_1.default.join(__dirname, "../../uploads", req.file.filename);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};
exports.createUser = createUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const missingField = ["email", "password"].find((field) => !req.body[field]);
        if (missingField) {
            res.status(400).json({
                message: `${missingField} is required!`,
            });
            return;
        }
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "100d" });
        // const expirationDate = new Date();
        // expirationDate.setDate(expirationDate.getDate() + 100);
        // await prisma.account.deleteMany({
        //   where: { user_id: user.id }
        // });
        // let data =   await prisma.account.create({
        //   data: {
        //     user_id: user.id,
        //     token: token,
        //     expires_at: expirationDate
        //   }
        // });
        if (user.role === "ADMIN") {
            const rawIp = req.ip || req.socket.remoteAddress || "Unknown";
            const ipAddress = rawIp.replace("::ffff:", "");
            (0, emailService_utils_1.sendAdminLoginNotification)(user.email, user.name, ipAddress);
        }
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image ? `${base_utl_1.baseUrl}/uploads/${user.image}` : null,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};
exports.loginUser = loginUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.user;
        const { name, email } = req.body;
        const newImage = req.file;
        const existingUser = await prisma.user.findUnique({
            where: { id: String(id) },
        });
        // await prisma.account.upsert();
        if (!existingUser) {
            if (newImage) {
                fs_1.default.unlinkSync(path_1.default.join(__dirname, "../../uploads", newImage.filename));
            }
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        // Handle file replacement: delete old image if a new one is uploaded
        if (newImage && existingUser.image) {
            const oldImagePath = path_1.default.join(__dirname, "../../uploads", existingUser.image);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        const user = await prisma.user.update({
            where: { id: String(id) },
            data: {
                name: name || existingUser.name,
                email: email || existingUser.email,
                image: newImage ? newImage.filename : existingUser.image,
            },
        });
        const imageUrl = user.image ? (0, base_utl_1.getImageUrl)(`/uploads/${user.image}`) : null;
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: imageUrl,
            },
        });
    }
    catch (error) {
        if (req.file) {
            fs_1.default.unlinkSync(path_1.default.join(__dirname, "../../uploads", req.file.filename));
        }
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};
exports.updateUser = updateUser;
const changePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            res
                .status(400)
                .json({ message: "Both old and new passwords are required!" });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: String(id) },
        });
        if (!user) {
            res.status(404).json({ message: "password not found" });
            return;
        }
        const isOldPasswordValid = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            res.status(401).json({ message: "Old password is incorrect" });
            return;
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: String(id) },
            data: { password: hashedNewPassword },
        });
        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};
exports.changePassword = changePassword;
const createPartnership = async (req, res) => {
    try {
        const { email, password } = req.body;
        const missingField = ["email", "password"].find((field) => !req.body[field]);
        if (missingField) {
            res.status(400).json({
                message: `${missingField} is required!`,
            });
            return;
        }
        const existingPartnership = await prisma.user.findUnique({
            where: { email },
        });
        if (existingPartnership) {
            res.status(400).json({
                message: "Email already exists",
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const partnership = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "PARTNER",
            },
        });
        // Send welcome email with credentials
        (0, emailService_utils_1.sendPartnershipWelcomeEmail)(email, password);
        res.status(201).json({
            success: true,
            message: "Partnership created successfully",
            partnership,
        });
    }
    catch (error) {
        console.error("Partnership creation error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};
exports.createPartnership = createPartnership;
const updatePartnerProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { name } = req.body;
        const newImage = req.file;
        const existingUser = await prisma.user.findUnique({
            where: { id: String(id) },
        });
        if (!existingUser) {
            if (newImage) {
                const imagePath = path_1.default.join(__dirname, "../../uploads", newImage.filename);
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        if (newImage && existingUser.image) {
            const oldImagePath = path_1.default.join(__dirname, "../../uploads", existingUser.image);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
        }
        const user = await prisma.user.update({
            where: { id: String(id) },
            data: {
                name: name || existingUser.name,
                image: newImage ? newImage.filename : existingUser.image,
            },
        });
        const imageUrl = user.image ? (0, base_utl_1.getImageUrl)(`/uploads/${user.image}`) : null;
        res.status(200).json({
            success: true,
            message: "Partner profile updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: imageUrl,
                role: user.role,
            },
        });
    }
    catch (error) {
        if (req.file) {
            const imagePath = path_1.default.join(__dirname, "../../uploads", req.file.filename);
            if (fs_1.default.existsSync(imagePath)) {
                fs_1.default.unlinkSync(imagePath);
            }
        }
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};
exports.updatePartnerProfile = updatePartnerProfile;
const getAllPartners = async (req, res) => {
    try {
        const partners = await prisma.user.findMany({
            where: { role: "PARTNER" },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            },
        });
        const partnersWithImageUrls = partners.map((partner) => ({
            ...partner,
            image: partner.image ? (0, base_utl_1.getImageUrl)(`/uploads/${partner.image}`) : null,
        }));
        res.status(200).json({
            success: true,
            partners: partnersWithImageUrls,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
};
exports.getAllPartners = getAllPartners;
const checkAuthStatus = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: "No token provided",
            });
            return;
        }
        // Remove 'Bearer ' prefix if present
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Invalid token format",
            });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (jwtError) {
            res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
            return;
        }
        if (!decoded || typeof decoded !== "object" || !decoded.id) {
            res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
            return;
        }
        const user = await prisma.user
            .findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                accounta: {
                    select: {
                        token: true,
                        expires_at: true,
                    },
                },
            },
        })
            .catch(() => null); // Handle potential database errors gracefully
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const account = user.accounta[0];
        // Add buffer time (5 minutes) to prevent edge cases
        const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        const now = new Date();
        const expirationDate = account?.expires_at
            ? new Date(account.expires_at)
            : null;
        const isExpired = !expirationDate || now.getTime() + bufferTime > expirationDate.getTime();
        if (!account || !account.token || isExpired) {
            res.status(401).json({
                success: false,
                message: "Session expired",
            });
            return;
        }
        console.log(account.token);
        console.log(user);
        console.log(token);
        // Verify that the token matches the one stored in the database
        if (account.token !== token) {
            res.status(401).json({
                success: false,
                message: "Invalid session",
            });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image ? `${base_utl_1.baseUrl}/uploads/${user.image}` : null,
                role: user.role,
            },
        });
    }
    catch (error) {
        // Log the error for debugging but don't expose details to client
        console.error("Auth check error:", error);
        res.status(500).json({
            success: false,
            message: "Authentication check failed",
        });
    }
};
exports.checkAuthStatus = checkAuthStatus;
//# sourceMappingURL=users.controllers.js.map
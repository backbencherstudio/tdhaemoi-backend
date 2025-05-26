import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { baseUrl, getImageUrl } from "../../utils/base_utl";
import { sendPartnershipWelcomeEmail } from "../../utils/emailService.utils";

const prisma = new PrismaClient();

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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const image = req.file;

    const missingField = ["name", "email", "password"].find(
      (field) => !req.body[field]
    );

    if (missingField) {
      if (image) {
        const imagePath = path.join(__dirname, "../../uploads", image.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
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
        const imagePath = path.join(__dirname, "../../uploads", image.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      res.status(400).json({
        message: "Email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: image ? image.filename : null,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "100d" }
    );

    const imageUrl = user.image ? getImageUrl(`/uploads/${user.image}`) : null;

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
  } catch (error) {
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        "../../uploads",
        req.file.filename
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const missingField = ["email", "password"].find(
      (field) => !req.body[field]
    );

    if (missingField) {
      res.status(400).json({
        message: `${missingField} is required!`,
      });
      return; // This stops further execution
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1m" }
    );

    // await prisma.account.upsert({
    //   where: {
    //     user_id: user.id
    //   },
    //   update: {
    //     token: token,
    //   },
    //   create: {
    //     user_id: user.id,
    //     token: token,
    //   }
    // });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ? `${baseUrl}/uploads/${user.image}` : null,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { name, email } = req.body;
    const newImage = req.file;

    // Retrieve the existing user from the database
    const existingUser = await prisma.user.findUnique({
      where: { id: String(id) }, // Use `id` from the authenticated user
    });

    // If the user doesn't exist, handle the error and delete any uploaded file
    if (!existingUser) {
      if (newImage) {
        fs.unlinkSync(path.join(__dirname, "../../uploads", newImage.filename));
      }
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    // Handle file replacement: delete old image if a new one is uploaded
    if (newImage && existingUser.image) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads",
        existingUser.image
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
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

    const imageUrl = user.image ? getImageUrl(`/uploads/${user.image}`) : null;

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
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(path.join(__dirname, "../../uploads", req.file.filename));
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
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

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      res.status(401).json({ message: "Old password is incorrect" });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: String(id) },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const createPartnership = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const missingField = ["email", "password"].find(
      (field) => !req.body[field]
    );

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
    const hashedPassword = await bcrypt.hash(password, 10);

    const partnership = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "PARTNER",
      },
    });

    // Send welcome email with credentials
    sendPartnershipWelcomeEmail(email, password);

    res.status(201).json({
      success: true,
      message: "Partnership created successfully",
      partnership,
    });
  } catch (error) {
    console.error("Partnership creation error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};


export const updatePartnerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { name } = req.body;
    const newImage = req.file;

    const existingUser = await prisma.user.findUnique({
      where: { id: String(id) },
    });

    if (!existingUser) {
      if (newImage) {
        const imagePath = path.join(__dirname, "../../uploads", newImage.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (newImage && existingUser.image) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads",
        existingUser.image
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: {
        name: name || existingUser.name,
        image: newImage ? newImage.filename : existingUser.image,
      },
    });

    const imageUrl = user.image ? getImageUrl(`/uploads/${user.image}`) : null;

    res.status(200).json({
      success: true,
      message: "Partner profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: imageUrl,
        role: user.role
      },
    });
  } catch (error) {
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        "../../uploads",
        req.file.filename
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};


export const getAllPartners = async (req: Request, res: Response) => {
  try {
    const partners = await prisma.user.findMany({
      where: { role: 'PARTNER' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      }
    });

    const partnersWithImageUrls = partners.map(partner => ({
      ...partner,
      image: partner.image ? getImageUrl(`/uploads/${partner.image}`) : null
    }));

    res.status(200).json({
      success: true,
      partners: partnersWithImageUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error
    });
  }
};

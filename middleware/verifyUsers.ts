import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: any;
}

const verifyUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json({ message: "No token provided" });
    return; 
  }

  const token = authHeader;

  if (!token) {
    res.status(401).json({ message: "Malformed token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    console.log(decoded)
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default verifyUser;
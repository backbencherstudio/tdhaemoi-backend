import { Request, Response } from "express";
import exercises from "./exercises.data";

export const getAllexercises = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true, exercises });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error, could not fetch exercises.",
      });
  }
};

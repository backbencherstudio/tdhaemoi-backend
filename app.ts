import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

import users from "./module/users/users.routes";
import products from "./module/products/products.routes";
import excel from "./module/excel/excel.routes";
import questions from "./module/question/question.routes";

import path from "path";



const app = express();

app.use(
  cors({
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
      'https://landing-page-iota-eight-94.vercel.app'
    ],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));


app.use("/users", users);
app.use("/products", products); // Add this line
app.use("/excel", excel)
app.use("/questions", questions)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: `404 route not found`,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    message: `500 Something broken!`,
    error: err.message,
  });
});

// Make sure this line is before your routes
app.use(express.static(path.join(__dirname, "public")));

export default app;
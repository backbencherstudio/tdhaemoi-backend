import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

// import users from "./module/v1/users/users.routes";
// import products from "./module/v1/products/products.routes";
// import excel from "./module/v1/excel/excel.routes";
// import questions from "./module/v1/question/question.routes";
// import partner from "./module/v1/partners/partners.routes";
// import suggestions from "./module/v1/suggestions/suggestions.routes";
// import message from "./module/v1/messages/messages.routes";
// import appointment from "./module/v1/appointment/appointment.routes";

import v1 from "./module/v1/index";
import v2 from "./module/v2/index";
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
      "http://192.168.30.102:3000",
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
      "https://landing-page-iota-eight-94.vercel.app",
      "http://localhost:3002",
      "https://tdhaemoi-partner-dashbaord.vercel.app",
      
    ],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

// app.use("/users", users);
// app.use("/products", products); // Add this line
// app.use("/excel", excel)
// app.use("/questions", questions)
// app.use("/partner", partner);
// app.use("/suggestions", suggestions);
// app.use("/message", message)
// app.use("/appointment", appointment)

app.use("/", v1);
app.use("/v2", v2);


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

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

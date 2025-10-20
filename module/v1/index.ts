import express from "express";

import users from "./auth/users.routes";
import products from "./products/products.routes";
import excel from "./excel/excel.routes";
import questions from "./question/question.routes";
import partner from "./partners/partners.routes";
import suggestions from "./suggestions/suggestions.routes";
import message from "./messages/messages.routes";
import appointment from "./appointment/appointment.routes";
import versorgungen from "./versorgungen/versorgungen.routes";
import employees from "./employees/employees.routes";
import customers from "./customers/customers.routes";
import einlagenFinder from "./einlagenFinder/einlagenFinder.routes";
import exercises from "./exercises/exercises.routes";
import customerHistory from "./customers-history/customersHistory.routes";
import customerOrders from "./customerOrders/customerOrders.routes";
import customerPrice from "./customerPrice/customerPrice.routes";
import workeshopNote from "./workshopNote/workshopNote.routes";
import storage from "./storage/storage.routes";
import bestellubersicht from "./bestellubersicht/Bestellubersicht.routes";
import custom_shafts from "./custom_shafts/custom_shafts.routes"

import path from "path";

const router = express.Router();

const moduleRoutes = [
  { path: "/users", route: users },
  { path: "/products", route: products },
  { path: "/excel", route: excel },
  { path: "/questions", route: questions },
  { path: "/partner", route: partner },
  { path: "/suggestions", route: suggestions },
  { path: "/message", route: message },
  { path: "/appointment", route: appointment },
  { path: "/versorgungen", route: versorgungen },
  { path: "/employees", route: employees },
  { path: "/customers", route: customers },
  { path: "/einlagen-finder", route: einlagenFinder },
  { path: "/exercises", route: exercises },
  { path: "/customers-history", route: customerHistory },
  { path: "/customer-orders", route: customerOrders },
  { path: "/customer-price", route: customerPrice },
  { path: "/workshop-note", route: workeshopNote },
  { path: "/store", route: storage },
  { path: "/bestellubersicht", route: bestellubersicht },
  { path: "/custom_shafts", route: custom_shafts}
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;

import express from 'express';

import users from './users/users.routes';
import products from './products/products.routes';
import excel from './excel/excel.routes';
import questions from './question/question.routes';
import partner from './partners/partners.routes';
import suggestions from './suggestions/suggestions.routes';
import message from './messages/messages.routes';
import appointment from './appointment/appointment.routes';

const router = express.Router();

const moduleRoutes = [
  { path: '/users', route: users },
  { path: '/products', route: products },
  { path: '/excel', route: excel },
  { path: '/questions', route: questions },
  { path: '/partner', route: partner },
  { path: '/suggestions', route: suggestions },
  { path: '/message', route: message },
  { path: '/appointment', route: appointment },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;

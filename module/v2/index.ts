import express from 'express';

import exercises from './exercises/exercises.routes';
import appointment from './appointment/appointment.routes';

const router = express.Router();

const moduleRoutes = [
  { path: '/exercises', route: exercises },
  { path: '/appointment', route: appointment },
 
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;

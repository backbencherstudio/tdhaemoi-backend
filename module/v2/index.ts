import express from 'express';

import exercises from './exercises/exercises.routes';

const router = express.Router();

const moduleRoutes = [
  { path: '/exercises', route: exercises },
 
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;

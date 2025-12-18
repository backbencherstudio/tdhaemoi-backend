import express from 'express';

import exercises from './exercises/exercises.routes';
import appointment from './appointment/appointment.routes';
import featureAccess from './feature_access/feature_access.routes';
import notifications from './notifications/notifications.routes';

const router = express.Router();

const moduleRoutes = [
  { path: '/exercises', route: exercises },
  { path: '/appointment', route: appointment },
  { path: '/feature-access', route: featureAccess },
  { path: '/notifications', route: notifications},
 
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;

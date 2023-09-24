import { Router } from 'express';
import passport from 'passport';

import { resto as passportConfig } from '../../../../services/passport/passportConfig';
import * as authController from './controller';

passportConfig(passport);

// route: /api/v2/resto
const restoAuthRouter = Router();

restoAuthRouter.post('/signup', authController.signupForm);
restoAuthRouter.get('/signup/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
restoAuthRouter.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.signInUpOAuth,
);
restoAuthRouter.post('/signin', authController.signinForm);
restoAuthRouter.get('/signin/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
restoAuthRouter.get('/signout', authController.signOut);

export default restoAuthRouter;

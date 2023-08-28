import { Router } from 'express';
import passport from 'passport';
import { customer as passportConfigCustomer } from '../../../../services/passport/passportConfig';

import * as authController from './controller';

passportConfigCustomer(passport);

// route /api/v1/auth
const customerAuthRouter = Router();

customerAuthRouter.post('/signup', authController.signupForm);
customerAuthRouter.get('/signup/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
customerAuthRouter.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.signInUpOAuth
);
customerAuthRouter.post('/signin', authController.signinForm);
customerAuthRouter.get('/signin/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

export default customerAuthRouter;
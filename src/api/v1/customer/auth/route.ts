import { Router } from 'express';
import passport from 'passport';
import { customer as passportConfigCustomer } from '../../../../services/passport/passportConfig';

import * as customerAuthController from './controller';

passportConfigCustomer(passport);

// route /api/v1/auth
const customerAuthRouter = Router();

customerAuthRouter.post('/signup', customerAuthController.signupForm);
customerAuthRouter.get('/signup/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
customerAuthRouter.get('/google/callback',
  passport.authenticate('google', { session: false }),
  customerAuthController.signInUpOAuth
);
customerAuthRouter.post('/signin', customerAuthController.signinForm);
customerAuthRouter.get('/signin/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

export default customerAuthRouter;
import { Router } from 'express';
import { signInUpOAuthController, signinFormController, signupFormController } from './controller';
import passport from 'passport';
import passportConfigResto from '../../../../services/passport/passportConfigResto';

passportConfigResto(passport);
// route /api/v1/resto/auth
const restoAuthRouter = Router();

restoAuthRouter.post('/signup', signupFormController);
restoAuthRouter.get('/signup/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
restoAuthRouter.get('/google/callback',
  passport.authenticate('google', { session: false }),
  signInUpOAuthController
);
restoAuthRouter.post('/signin', signinFormController);
restoAuthRouter.get('/signin/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

export default restoAuthRouter;
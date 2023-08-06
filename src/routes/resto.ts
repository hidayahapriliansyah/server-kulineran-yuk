import { Router, Request, Response } from 'express';
import { signInUpOAuthController, signinFormController, signupFormController } from '../controllers/resto/auth';
import passport from 'passport';
import passportConfigResto from '../services/passport/passportConfigResto';
import { IRestaurant } from '../models/Restaurant';
import { createJWTPayloadDataRestoAccessToken } from '../utils';
import { createAccessToken } from '../utils/jwt';
import config from '../config';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../global/types';
import { minimumSetupAccount } from '../middleware/minimumSetupAccount';
import { authenticationAdminRestoAccount } from '../middleware/auth';
import { isEmailRestoVerified } from '../middleware/emailVerification';
import { getProfileController, updateProfileController } from '../controllers/resto/profile';

const restoRouter = Router();
passportConfigResto(passport);

// auth
restoRouter.post('/auth/signup', signupFormController);
restoRouter.get('/auth/signup/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
restoRouter.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  signInUpOAuthController
);
restoRouter.post('/auth/signin', signinFormController);
restoRouter.get('/auth/signin/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// profile
restoRouter.get('/profile',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified, 
  getProfileController,
);
restoRouter.put('/profile',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified, 
  updateProfileController,
);
// account
// order today
// order history
// menu
// custom menu
// review
// notification

export default restoRouter;

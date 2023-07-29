import express, { Router, Request, Response } from 'express';
import { signupFormController } from '../controllers/resto/auth';
import passport, { session } from 'passport';
import passportConfigResto from '../services/passport/passportConfigResto';
import { IRestaurant } from '../models/Restaurant';

const restoRouter = Router();
passportConfigResto(passport);

// auth
restoRouter.post('/auth/signup', signupFormController);
restoRouter.get('/auth/signup/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
restoRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    // todo create jwt token
    const user = req.user as IRestaurant;
    if (user.passMinimumProfileSetting) {
      console.log('redirect to complete profile setting');
    } else {
      console.log('redirect to dashboard/home page');
    }
    console.log('request user dari oauth', req.user);
  }
);
restoRouter.post('/auth/signin', () => {});

// profile
// account
// order today
// order history
// menu
// custom menu
// review
// notification

export default restoRouter;

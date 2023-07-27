import express, { Router, Request, Response } from 'express';
import { signupFormController } from '../controllers/resto/auth';

const restoRouter = Router();

// auth
restoRouter.post('/signup', signupFormController);

// profile
// account
// order today
// order history
// menu
// custom menu
// review
// notification

export default restoRouter;

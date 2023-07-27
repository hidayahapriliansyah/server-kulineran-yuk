import express, { Router, Request, Response } from 'express';
import { signupForm } from './controller';

const restoAuthRouter = Router();

restoAuthRouter.post('/signup', signupForm);

export default restoAuthRouter;

import express, { Router, Request, Response } from 'express';

const restoAuthRouter = Router();

restoAuthRouter.post('/signup', signupfrom);

export default restoAuthRouter;

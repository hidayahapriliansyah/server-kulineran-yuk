import express, { Router, Request, Response } from 'express';

const customerRouter = Router();

// these routers represent every feature base on api spec
customerRouter.get('/', (req: Request, res: Response) => {
  res.send('Customer router');
});

export default customerRouter;
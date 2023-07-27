import express, { Router, Request, Response } from 'express';

const restoRouter = Router();

restoRouter.use('/', () => {});

restoRouter.get('/', (req: Request, res: Response) => {
  res.send('Resto router');
});

export default restoRouter;
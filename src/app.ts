import express, { Request, Response } from 'express';
import config from './config';
import mongoose from 'mongoose';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

export default app;

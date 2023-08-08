import { Router } from 'express';
import { createReEmailVerificationRequestController } from './controller';

const restoAccountRouter = Router();

// route: /api/v1/resto/account
restoAccountRouter.post('/verification', createReEmailVerificationRequestController);
restoAccountRouter.get('/verification/:uniqueString', () => {});

export default restoAccountRouter;

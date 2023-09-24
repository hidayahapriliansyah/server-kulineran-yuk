import { Router } from 'express';

import * as customerBotramCartController from './controller';

// route: /api/v2/botram-cart
const customerBotramCartRouter = Router();

customerBotramCartRouter.get('/', customerBotramCartController.getBotramCart);
customerBotramCartRouter.post('/item', customerBotramCartController.addMenuToBotramCart);
customerBotramCartRouter.get('/detail/:botramGroupId', customerBotramCartController.getItemsByBotramGroup);
customerBotramCartRouter.put('/item/:botramCartId/quantity', customerBotramCartController.updateQtyOfBotramCartItem);
customerBotramCartRouter.delete('/item/:botramCartId', customerBotramCartController.deleteBotramCartItem);
customerBotramCartRouter.delete('/bulk', customerBotramCartController.itemBulkDeletion);

export default customerBotramCartRouter;

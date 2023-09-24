import { Router } from 'express';

import * as customerOrderController from './controller';

// route: /api/v2/resto/orders
const restoOrdersRouter = Router();

restoOrdersRouter.get('/', customerOrderController.getAllOrders);
restoOrdersRouter.get('/count', customerOrderController.getCountOrder);
restoOrdersRouter.get('/today', customerOrderController.getTodayOrder);
restoOrdersRouter.get('/find', customerOrderController.findOrderDetailByCustomerUsername);
restoOrdersRouter.get('/:orderId', customerOrderController.getDetailOrderById);
restoOrdersRouter.put('/:orderId/status', customerOrderController.updateCustomerOrderStatus);
restoOrdersRouter.put('/:orderId/paid', customerOrderController.updateCustomerOrderPaymentStatus);
restoOrdersRouter.put('/:botramOrderId/botram/status', customerOrderController.updateBotramOrderStatus);
restoOrdersRouter.put('/:botramOrderId/botram/paid', customerOrderController.updateBotramOrderPaymentStatus);

export default restoOrdersRouter;

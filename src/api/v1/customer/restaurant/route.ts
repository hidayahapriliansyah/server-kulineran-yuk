import { Router } from 'express';

import * as customerController from './controller';
import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';

// route: /api/v1/restaurant
const customerRestaurantRouter = Router();

customerRestaurantRouter.get('/:restaurantUsername', 
  authenticationCustomerAccount,
  isEmailCustomerVerified,
  customerController.findRestaurantByUsername
);
customerRestaurantRouter.get('/:restaurantUsername/profile', customerController.getRestaurantProfile);
customerRestaurantRouter.get('/:restaurantUsername/menus', customerController.getAllRestaurantMenus);
customerRestaurantRouter.get('/:restaurantUsername/reviews', customerController.getAllRestaurantReviews);
customerRestaurantRouter.post('/:restaurantUsername/reviews',
  authenticationCustomerAccount,
  isEmailCustomerVerified,
  customerController.createRestaurantReviews,
  );
  customerRestaurantRouter.put('/:restaurantUsername/reviews/:reviewId', 
  authenticationCustomerAccount,
  isEmailCustomerVerified,
  customerController.updateRestaurantReviews,
  );
  customerRestaurantRouter.delete('/:restaurantUsername/reviews/:reviewId',
  authenticationCustomerAccount,
  isEmailCustomerVerified,
  customerController.deleteRestaurantReviews,
);

export default customerRestaurantRouter;

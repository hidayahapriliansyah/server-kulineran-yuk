import { Router } from 'express';

import * as restaurantController from './controller';
import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';

// route: /api/v1/restaurant
const customerRestaurantRouter = Router();

customerRestaurantRouter.get('/:restaurantUsername', 
  authenticationCustomerAccount,
  isEmailCustomerVerified,
  restaurantController.findRestaurantByUsername
);
customerRestaurantRouter.get('/:restaurantUsername/profile', restaurantController.getRestaurantProfile);
customerRestaurantRouter.get('/:restaurantUsername/menus', restaurantController.getAllRestaurantMenus);
customerRestaurantRouter.get('/:restaurantUsername/reviews', restaurantController.getAllRestaurantReviews);
customerRestaurantRouter.post('/:restaurantUsername/reviews',
  authenticationCustomerAccount,
  isEmailCustomerVerified,
  restaurantController.createRestaurantReviews,
  );
  customerRestaurantRouter.put('/:restaurantUsername/reviews/:reviewId', 
  authenticationCustomerAccount,
  isEmailCustomerVerified,
  restaurantController.updateRestaurantReviews,
  );
  customerRestaurantRouter.delete('/:restaurantUsername/reviews/:reviewId',
  authenticationCustomerAccount,
  isEmailCustomerVerified,
  restaurantController.deleteRestaurantReviews,
);

export default customerRestaurantRouter;

import { Router } from 'express';

import * as restoReviewController from './controller';
import { authenticationAdminRestoAccount } from '../../../../middleware/auth';
import { isEmailRestoVerified } from '../../../../middleware/emailVerification';
import { minimumSetupAccount } from '../../../../middleware/minimumSetupAccount';

// route: /api/v2/resto/reviews
const restoReviewsRouter = Router();

restoReviewsRouter.use(
  authenticationAdminRestoAccount,
  isEmailRestoVerified,
  minimumSetupAccount
);

restoReviewsRouter.get('/', restoReviewController.getAllRestaurantReviews);
restoReviewsRouter.get('/reviewId', restoReviewController.getDetailReviewById);
restoReviewsRouter.post('/reviewId/reply', restoReviewController.createReviewResponse);
restoReviewsRouter.put('/responseId/reply', restoReviewController.updateReviewResponse);
restoReviewsRouter.delete('/responseId/reply', restoReviewController.deleteReviewResponse);

export default restoReviewsRouter;

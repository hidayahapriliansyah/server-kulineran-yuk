import { authenticationAdminRestoAccount } from '../../../../middleware/auth';
import { minimumSetupAccount } from '../../../../middleware/minimumSetupAccount';
import { Router } from 'express';
import { isEmailRestoVerified } from '../../../../middleware/emailVerification';
import * as profileController from './controller';

// route: /api/v2/resto/profile
const restoProfileRouter = Router();

restoProfileRouter.get('/',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified,
  profileController.getProfile,
);
restoProfileRouter.put('/',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified,
  profileController.updateProfile,
);
restoProfileRouter.put('/setup',
  authenticationAdminRestoAccount,
  isEmailRestoVerified,
  profileController.setupProfile,
);
restoProfileRouter.put('/customer-payment-type',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified,
  profileController.updateCustomerPaymentType,
);

export default restoProfileRouter;

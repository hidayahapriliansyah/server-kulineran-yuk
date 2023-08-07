import { authenticationAdminRestoAccount } from '../../../../middleware/auth';
import { minimumSetupAccount } from '../../../../middleware/minimumSetupAccount';
import { Router } from 'express';
import { isEmailRestoVerified } from '../../../../middleware/emailVerification';
import { getProfileController, setupProfileController, updateCustomerPaymentTypeController, updateProfileController } from './controller';

// route: /api/v1/resto/profile
const restoProfileRouter = Router();

restoProfileRouter.get('/',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified,
  getProfileController
);
restoProfileRouter.put('/',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified,
  updateProfileController
);
restoProfileRouter.put('/setup',
  authenticationAdminRestoAccount,
  isEmailRestoVerified,
  setupProfileController,
);
restoProfileRouter.put('/customer-payment-type',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified,
  updateCustomerPaymentTypeController,
);

export default restoProfileRouter;

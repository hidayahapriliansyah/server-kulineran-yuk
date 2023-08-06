import { authenticationAdminRestoAccount } from '../../../../middleware/auth';
import { minimumSetupAccount } from '../../../../middleware/minimumSetupAccount';
import { Router } from 'express';
import { isEmailRestoVerified } from '../../../../middleware/emailVerification';
import { getProfileController, updateProfileController } from './controller';

// route: /api/v1/resto/profile
const restoProfileRouter = Router();

restoProfileRouter.get('/profile',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified,
  getProfileController
);
restoProfileRouter.put('/profile',
  authenticationAdminRestoAccount,
  minimumSetupAccount,
  isEmailRestoVerified,
  updateProfileController
);

export default restoProfileRouter;

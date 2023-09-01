import { Router } from 'express';
import { authenticationAdminRestoAccount } from '../../../../middleware/auth';
import { minimumSetupAccount } from '../../../../middleware/minimumSetupAccount';
import { isEmailRestoVerified } from '../../../../middleware/emailVerification';
import * as customMenuController from './controller';

// route: /api/v2/resto/custom-menu
const restoCustomMenuRouter = Router();

// middleware
restoCustomMenuRouter.use(authenticationAdminRestoAccount, minimumSetupAccount, isEmailRestoVerified,); 

restoCustomMenuRouter.get('/categories', customMenuController.getAllCustomMenuCategory);
restoCustomMenuRouter.post('/categories', customMenuController.createCustomMenuCategory);
restoCustomMenuRouter.get('/categories/:categoryId', customMenuController.getSpecificCustomMenuCategory);
restoCustomMenuRouter.put('/categories/:categoryId', customMenuController.updateCustomMenuCategory);
restoCustomMenuRouter.delete('/categories/:categoryId', customMenuController.deleteCustomMenuCategory);

restoCustomMenuRouter.get('/compositions', customMenuController.getAllCustomMenuComposition);
restoCustomMenuRouter.post('/compositions', customMenuController.createCustomMenuComposition);
restoCustomMenuRouter.get('/compositions/:compositionId', customMenuController.getSpecificCustomMenuComposition);
restoCustomMenuRouter.put('/compositions/:compositionId', customMenuController.updateCustomMenuComposition);
restoCustomMenuRouter.delete('/compositions/:compositionId', customMenuController.deleteCustomMenuComposition);

export default restoCustomMenuRouter;

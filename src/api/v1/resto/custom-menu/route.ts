import { Router } from 'express';
import { authenticationAdminRestoAccount } from '../../../../middleware/auth';
import { minimumSetupAccount } from '../../../../middleware/minimumSetupAccount';
import { isEmailRestoVerified } from '../../../../middleware/emailVerification';
import {
  createCustomMenuCategoryController,
  createCustomMenuCompositionController,
  deleteCustomMenuCategoryController,
  deleteCustomMenuCompositionController,
  getAllCustomMenuCategoryController,
  getAllCustomMenuCompositionController,
  getSpecificCustomMenuCategoryController,
  getSpecificCustomMenuCompositionController,
  updateCustomMenuCategoryController,
  updateCustomMenuCompositionController,
} from './controller';

// route: /api/v1/resto/custom-menu
const restoCustomMenuRouter = Router();

// middleware
restoCustomMenuRouter.use(authenticationAdminRestoAccount, minimumSetupAccount, isEmailRestoVerified,); 

restoCustomMenuRouter.get('/categories', getAllCustomMenuCategoryController);
restoCustomMenuRouter.post('/categories', createCustomMenuCategoryController);
restoCustomMenuRouter.get('/categories/:categoryId', getSpecificCustomMenuCategoryController);
restoCustomMenuRouter.put('/categories/:categoryId', updateCustomMenuCategoryController);
restoCustomMenuRouter.delete('/categories/:categoryId', deleteCustomMenuCategoryController);

restoCustomMenuRouter.get('/compositions', getAllCustomMenuCompositionController);
restoCustomMenuRouter.post('/compositions', createCustomMenuCompositionController);
restoCustomMenuRouter.get('/compositions/:compositionId', getSpecificCustomMenuCompositionController);
restoCustomMenuRouter.put('/compositions/:compositionId', updateCustomMenuCompositionController);
restoCustomMenuRouter.delete('/compositions/:compositionId', deleteCustomMenuCompositionController);

export default restoCustomMenuRouter;

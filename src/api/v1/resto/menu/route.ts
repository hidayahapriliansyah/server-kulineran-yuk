import { Router } from 'express';
import { authenticationAdminRestoAccount } from '../../../../middleware/auth';
import { minimumSetupAccount } from '../../../../middleware/minimumSetupAccount';
import { isEmailRestoVerified } from '../../../../middleware/emailVerification';
import { createEtalaseController, createRestaurantMenuController, deleteEtalaseController, deleteRestaurantMenuController, getAllEtalaseController, getAllRestaurantMenuController, getRestaurantMenuBySlugController, updateEtalaseController } from './controller';

// route: /api/v1/resto/menus
const restoMenusRouter = Router();

// middleware
restoMenusRouter.use(authenticationAdminRestoAccount, minimumSetupAccount, isEmailRestoVerified,); 

restoMenusRouter.post('/etalase', createEtalaseController);
restoMenusRouter.get('/etalase', getAllEtalaseController);
restoMenusRouter.put('/etalase/:etalaseId', updateEtalaseController);
restoMenusRouter.delete('/etalase/:etalaseId', deleteEtalaseController);

restoMenusRouter.get('/', getAllRestaurantMenuController);
restoMenusRouter.post('/', createRestaurantMenuController);
restoMenusRouter.get('/:slug', getRestaurantMenuBySlugController);
restoMenusRouter.put('/:menuId', updateEtalaseController); 
restoMenusRouter.delete('/:menuId', deleteRestaurantMenuController); 

export default restoMenusRouter;
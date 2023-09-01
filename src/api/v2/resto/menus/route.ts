import { Router } from 'express';
import { authenticationAdminRestoAccount } from '../../../../middleware/auth';
import { minimumSetupAccount } from '../../../../middleware/minimumSetupAccount';
import { isEmailRestoVerified } from '../../../../middleware/emailVerification';
import * as menuController from './controller';

// route: /api/v2/resto/menus
const restoMenusRouter = Router();

// middleware
restoMenusRouter.use(authenticationAdminRestoAccount, minimumSetupAccount, isEmailRestoVerified,); 

restoMenusRouter.get('/etalase', menuController.getAllEtalase);
restoMenusRouter.post('/etalase', menuController.createEtalase);
restoMenusRouter.put('/etalase/:etalaseId', menuController.updateEtalase);
restoMenusRouter.delete('/etalase/:etalaseId', menuController.deleteEtalase);

restoMenusRouter.get('/', menuController.getAllRestaurantMenu);
restoMenusRouter.post('/', menuController.createRestaurantMenu);
restoMenusRouter.get('/:slug', menuController.getRestaurantMenuBySlug);
restoMenusRouter.put('/:menuId', menuController.updateRestaurantMenu); 
restoMenusRouter.delete('/:menuId', menuController.deleteRestaurantMenu); 

export default restoMenusRouter;
import { Router } from 'express';

import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';
import isGroupBotramMember from '../../../../middleware/isGroupBotramMember';
import isGroupBotramAdmin from '../../../../middleware/isGroupBotramAdmin';
import * as botramController from './controller';

const customerBotramRouter = Router();

// route: /api/v2/botram
customerBotramRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerBotramRouter.get('/', botramController.getAllCustomerBotramGroup);
customerBotramRouter.get('/:customerUsername/customer', botramController.findCustomerToBeAddedToBotramGroup);
customerBotramRouter.post('/', botramController.createBotramGroup);
customerBotramRouter.get('/:botramId', botramController.getSpecificCustomerBotramGroup);
customerBotramRouter.post('/:botramId', botramController.joinOpenMemberBotramGroup);
customerBotramRouter.put(
  '/:botramId',
  isGroupBotramMember,
  botramController.exitFromBotramGroupForMemberOnly,
);
customerBotramRouter.get(
  '/:botramId/members',
  isGroupBotramMember,
  botramController.getMemberAndMemberOrderOfBotramGroup,
);
customerBotramRouter.put(
  '/:botramId/members/:memberId/kick',
  isGroupBotramAdmin,
  botramController.kickMemberBotramGroupByAdmin,
);
customerBotramRouter.put(
  '/:botramId/members/:memberId/paid',
  isGroupBotramAdmin,
  botramController.updateMemberStatusPaymentByAdmin,
);
customerBotramRouter.put(
  '/:botramId/orders',
  isGroupBotramAdmin,
  botramController.updateGroupBotramStatusToAllReadyOrder,
);
customerBotramRouter.post(
  '/:botramId/orders',
  isGroupBotramMember,
  botramController.createBotramMemberOrder,
);

export default customerBotramRouter;

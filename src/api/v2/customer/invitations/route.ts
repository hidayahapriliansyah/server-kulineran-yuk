import { Router } from 'express';

import { authenticationCustomerAccount } from '../../../../middleware/auth';
import { isEmailCustomerVerified } from '../../../../middleware/emailVerification';
import * as invitationsController from './controller';

// route: /api/v2/invitations
const customerInvitationRouter = Router();

customerInvitationRouter.use(authenticationCustomerAccount, isEmailCustomerVerified);

customerInvitationRouter.get('/', invitationsController.getAllInvitationsBotramGroup);
customerInvitationRouter.get('/:invitationId', invitationsController.getSpecificInvitationBotramGroup);
customerInvitationRouter.put('/:invitationId', invitationsController.acceptInvitationBotramGroup);
customerInvitationRouter.delete('/:invitationId', invitationsController.rejectInvitationsBotramGroup);

export default customerInvitationRouter;

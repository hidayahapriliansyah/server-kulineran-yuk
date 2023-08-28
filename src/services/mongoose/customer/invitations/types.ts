import { ICustomer } from '../../../../models/Customer';
import { IGroupBotram } from '../../../../models/GroupBotram';
import { IGroupBotramInvitation } from '../../../../models/GroupBotramInvitation';
import { IRestaurant } from '../../../../models/Restaurant';

type InvitationBotramGroupResponse = {
  _id: IGroupBotramInvitation['_id'];
  groupBotram: {
    _id: IGroupBotram['_id'];
    createdAt: IGroupBotram['createdAt'];
    name: IGroupBotram['name'];
    restaurant: {
      _id: IRestaurant['_id'];
      username: IRestaurant['username'];
      name: IRestaurant['name'];
    };
    status: IGroupBotram['status'];
    admin: {
      username: ICustomer['username'];
      name: ICustomer['name'];
    };
    memberCount: number;
  };
}

type GetAllInvitationsBotramGroupResponse = {
  _id: InvitationBotramGroupResponse['_id'];
  groupBotram: Omit<InvitationBotramGroupResponse['groupBotram'], 'admin' | 'memberCount'>;
}[] | [];

export {
  InvitationBotramGroupResponse,
  GetAllInvitationsBotramGroupResponse,
};

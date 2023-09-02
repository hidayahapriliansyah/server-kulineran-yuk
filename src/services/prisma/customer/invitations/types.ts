import {BotramGroup, BotramGroupInvitation, Customer, Restaurant } from '@prisma/client';

type InvitationBotramGroupResponse = {
  id: BotramGroupInvitation['id'];
  groupBotram: {
    id: BotramGroup['id'];
    createdAt: BotramGroup['createdAt'];
    name: BotramGroup['name'];
    restaurant: {
      id: Restaurant['id'];
      username: Restaurant['username'];
      name: Restaurant['name'];
    };
    status: BotramGroup['status'];
    admin: {
      username: Customer['username'];
      name: Customer['name'];
    };
    memberCount: number;
  };
}

type GetAllInvitationsBotramGroupResponse = {
  id: InvitationBotramGroupResponse['id'];
  groupBotram: Omit<InvitationBotramGroupResponse['groupBotram'], 'admin' | 'memberCount'>;
}[] | [];

export {
  InvitationBotramGroupResponse,
  GetAllInvitationsBotramGroupResponse,
};

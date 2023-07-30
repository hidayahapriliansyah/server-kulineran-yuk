import { Schema } from 'mongoose';
import { ICustomer } from '../models/Customer';
import { IRestaurant } from '../models/Restaurant';

export type IPayloadDataAccessToken = {
  _id: Schema.Types.ObjectId;
  email: string;
};

export type IPayloadDataIDToken = {
  name: string;
  username: string;
  email: string;
  avatar: string;
};

const createJWTPayloadDataRestoAccessToken = (
  data: IRestaurant
): IPayloadDataAccessToken => {
  const payloadData: Pick<IRestaurant, '_id' | 'email'>  = {
    _id: data._id,
    email: data.email,
  }
  return payloadData;
};

const createJWTPayloadDataCustomerAccessToken = (
  data: ICustomer
): IPayloadDataAccessToken => {
  const payloadData: Pick<ICustomer, '_id' | 'email'>  = {
    _id: data._id,
    email: data.email,
  };
  return payloadData;
};

const createJWTPayloadDataRestoIDToken = (
  data: IRestaurant
): IPayloadDataIDToken => {
  const payloadData: Pick<IRestaurant, 'name' | 'username' | 'email' | 'avatar'> = {
    name: data.name,
    username: data.username,
    email: data.email,
    avatar: data.avatar,
  }
  return payloadData;
};

const createJWTPayloadDataCustomerIDToken = (
  data: ICustomer
): IPayloadDataIDToken => {
  const payloadData: Pick<ICustomer, 'name' | 'username' | 'email' | 'avatar'> = {
    name: data.name,
    username: data.username,
    email: data.email,
    avatar: data.avatar,
  };
  return payloadData;
};

export {
  createJWTPayloadDataRestoAccessToken,
  createJWTPayloadDataCustomerAccessToken,
  createJWTPayloadDataRestoIDToken,
  createJWTPayloadDataCustomerIDToken,
};

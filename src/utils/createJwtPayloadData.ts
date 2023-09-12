import { Restaurant, Customer } from '@prisma/client';

export type PayloadDataAccessToken = {
  id: string;
  email: string;
};

export type PayloadDataRefreshToken = {
  id: string;
};

export type PayloadDataIDToken = {
  name: string;
  username: string;
  email: string;
  avatar: string;
};

const createJWTPayloadDataRestoAccessToken = (
  data: Restaurant
): PayloadDataAccessToken => {
  const payloadData: Pick<Restaurant, 'id' | 'email'>  = {
    id: data.id,
    email: data.email,
  }
  return payloadData;
};

const createJWTPayloadDataCustomerAccessToken = (
  data: Customer
): PayloadDataAccessToken => {
  const payloadData: Pick<Customer, 'id' | 'email'>  = {
    id: data.id,
    email: data.email,
  };
  return payloadData;
};

const createJWTPayloadDataRestoRefreshToken = (
  data: Restaurant
): PayloadDataRefreshToken => {
  return {
    id: data.id,
  };
};

const createJWTPayloadDataCustomerRefreshToken = (
  data: Customer
): PayloadDataRefreshToken => {
  return {
    id: data.id,
  };
};

const createJWTPayloadDataRestoIDToken = (
  data: Restaurant
): PayloadDataIDToken => {
  const payloadData: Pick<Restaurant, 'name' | 'username' | 'email' | 'avatar'> = {
    name: data.name,
    username: data.username,
    email: data.email,
    avatar: data.avatar,
  }
  return payloadData;
};

const createJWTPayloadDataCustomerIDToken = (
  data: Customer
): PayloadDataIDToken => {
  const payloadData: Pick<Customer, 'name' | 'username' | 'email' | 'avatar'> = {
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
  createJWTPayloadDataRestoRefreshToken,
  createJWTPayloadDataCustomerRefreshToken,
  createJWTPayloadDataRestoIDToken,
  createJWTPayloadDataCustomerIDToken,
};

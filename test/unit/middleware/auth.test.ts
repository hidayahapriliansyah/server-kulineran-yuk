import { Request, Response, NextFunction } from 'express';
import { authenticationAdminRestoAccount } from '../../../src/middleware/auth';
import config from '../../../src/config';
import { Unauthenticated } from '../../../src/errors';

const cookieName = config.restoAccessTokenCookieName;
const createNextMock = (): NextFunction  => jest.fn() as NextFunction;
// authenticationAdminRestoAccount
describe('authenticationAdminRestoAccount', () => {
  // success authentication and call next function
  it('success authentication and call next function', () => {
    const req = {
      cookies: {
        [cookieName]: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGM3MWY4NDc2YWY2NjBmOWQ2NWZiYjgiLCJlbWFpbCI6InBhdHVuZ2FuY291cnNlQGdtYWlsLmNvbSIsImlhdCI6MTY5MDc3MTMzMiwiZXhwIjoxNjkwODU3NzMyfQ.IqjPB2UW0GXqVbmC1pcbvKzmgX4l9gnklwnOtN-QAh8',
      },
    } as Request;
    const res = {} as Response;
    const next = createNextMock();
    authenticationAdminRestoAccount(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  // should throw unauthenticated error if token is invalid
  it('should throw unauthenticated error if token is invalid', () => {
    const req = {
      cookies: {
        [cookieName]: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      },
    } as Request;
    const res = {} as Response;
    const next = createNextMock();
    authenticationAdminRestoAccount(req, res, next);
    expect(next).toHaveBeenCalledWith(new Unauthenticated('Access denied. Please authenticate to access this resource.'));
  });
  // should throw unauthenticated error if no token cookie
  
  it('should throw unauthenticated error if token is invalid', () => {
    const req = {
      cookies: {
        [cookieName]: '',
      },
    } as Request;
    const res = {} as Response;
    const next = createNextMock();
    authenticationAdminRestoAccount(req, res, next);
    expect(next).toHaveBeenCalledWith(new Unauthenticated('Access denied. Please authenticate to access this resource.'));
  });
});
// authenticationCustomerAccount
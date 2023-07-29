import { Request, Response, NextFunction, json } from 'express';
import { signinForm, signupForm } from '../../services/mongoose/resto/auth';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../global/types';
import { IRestaurant } from '../../models/Restaurant';

const signupFormController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await signupForm(req) as IRestaurant['_id'];
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Signup successfully', {
        userId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

const signinFormController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await signinForm(req) as IRestaurant['_id'];
    res
      .status(StatusCodes.OK)
      .json(new SuccessAPIResponse('Signin successfully', {
        userId: result,
      }));
  } catch (error: any) {
    next(error);
  }
};

export { 
  signupFormController,
  signinFormController,
};

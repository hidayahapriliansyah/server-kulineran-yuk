import { Request, Response, NextFunction } from 'express';
import { SuccessAPIResponse } from '../../../../global/types';
import { StatusCodes } from 'http-status-codes';
import { signup } from '../../../../services/mongoose/resto/auth';

const signupForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await signup(req);
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Signup successfully', result));
  } catch (error: any) {
    next(error);
  }
};

export { signupForm };

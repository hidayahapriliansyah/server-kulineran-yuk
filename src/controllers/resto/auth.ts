import { Request, Response, NextFunction } from 'express';
import { signupForm } from '../../services/mongoose/resto/auth';
import { StatusCodes } from 'http-status-codes';
import { SuccessAPIResponse } from '../../global/types';

const signupFormController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await signupForm(req);
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessAPIResponse('Signup successfully', result));
  } catch (error: any) {
    next(error);
  }
};

export { signupFormController };

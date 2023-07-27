import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorAPIResponse } from '../global/types';

const routeNotFound = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).send(new ErrorAPIResponse('Route does not exist'));
};

export default routeNotFound;
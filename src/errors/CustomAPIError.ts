import { StatusCodes } from 'http-status-codes';

abstract class CustomAPIError extends Error {
  abstract statusCode: StatusCodes;

  constructor(message: string) {
    super(message);
  }
}

export default CustomAPIError;

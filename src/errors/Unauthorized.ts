import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class Unauthorized extends CustomAPIError {
  statusCode = StatusCodes.FORBIDDEN;
  constructor(message: string) {
    super(message);

    this.name = 'UnauthorizedError';
  }
}

export default Unauthorized;

import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class Unauthenticated extends CustomAPIError {
  statusCode = StatusCodes.UNAUTHORIZED;
  constructor(message: string) {
    super(message);

    this.name = 'Unauthorized API';
  }
}

export default Unauthenticated;

import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class InvalidToken extends CustomAPIError {
  statusCode = 498;
  constructor(message: string) {
    super(message);

    this.name = 'InvalidTokenError';
  }
}

export default InvalidToken;

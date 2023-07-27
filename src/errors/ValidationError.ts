import { StatusCodes } from 'http-status-codes';  
import CustomAPIError from './CustomAPIError';

class ValidationError extends CustomAPIError {
  errors: any;
  constructor(message: string, errors: any) {
    super(message);
    this.name = 'Validation Error API';
    this.errors = errors;
  }
}

export default ValidationError;

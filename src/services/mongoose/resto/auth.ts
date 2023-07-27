import { Request } from 'express';
import Restaurant from '../../../models/Restaurant';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

const SignupBodyForm = z.object({
  name: z.string().regex(/^[a-zA-Z0-9.,_-]+$/).min(3).max(50).nonempty(),
  username: z.string().regex(/^[a-zA-Z0-9._]+$/).min(3).max(30).nonempty(),
  email: z.string().email().nonempty(),
  password: z.string().min(6).nonempty(),
});

type SignupBodyForm = z.infer<typeof SignupBodyForm>;

const signup = async (req: Request) => {
  const body: SignupBodyForm = SignupBodyForm.parse(req.body); 
  const result = await Restaurant.create(body);
  return result;
};

export { signup };

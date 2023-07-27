import { Request } from 'express';
import Restaurant, { IRestaurant } from '../../../models/Restaurant';
import { z } from 'zod';

const SignupBodyForm = z.object({
  name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50).nonempty(),
  username: z.string().regex(/^[a-zA-Z0-9._']+$/).min(3).max(30).nonempty(),
  email: z.string().email().max(254).nonempty(),
  password: z.string().min(6).nonempty(),
});

type SignupBodyForm = z.infer<typeof SignupBodyForm>;

const signupForm = async (req: Request): Promise<IRestaurant> => {
  const body: SignupBodyForm = SignupBodyForm.parse(req.body);
  const payload: SignupBodyForm & { passMinimumProfileSetting: boolean } = {
    ...body,
    passMinimumProfileSetting: true,
  };
  const result = await Restaurant.create(payload);
  return result;
};

export { signupForm };

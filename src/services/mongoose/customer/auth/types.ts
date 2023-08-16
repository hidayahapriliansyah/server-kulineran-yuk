import { z } from 'zod';
import { IRestaurant } from '../../../../models/Restaurant';

const signupBodyForm = z.object({
  name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50).nonempty(),
  username: z.string().regex(/^[a-z0-9._']+$/).min(3).max(30).nonempty(),
  email: z.string().email().max(254).nonempty(),
  password: z.string().min(6).nonempty(),
});

type SignupBodyForm = z.infer<typeof signupBodyForm>;
type SignupPayload = SignupBodyForm & Pick<IRestaurant, 'passMinimumProfileSetting'>;

type SigninFormBody = {
  email: string;
  password: string;
};

export {
  signupBodyForm,
  SignupBodyForm,
  SignupPayload,
  SigninFormBody,
};

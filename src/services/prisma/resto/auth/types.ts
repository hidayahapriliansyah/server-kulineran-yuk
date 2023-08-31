import { z } from 'zod';
import { Prisma } from '@prisma/client';

const signupBodyForm = z.object({
  name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50).nonempty(),
  username: z.string().regex(/^[a-z0-9._']+$/).min(3).max(30).nonempty(),
  email: z.string().email().max(254).nonempty(),
  password: z.string().min(6).nonempty(),
});

type SignupBodyForm = z.infer<typeof signupBodyForm>;

type SigninFormBody = {
  email: string;
  password: string;
};

export {
  signupBodyForm,
  SignupBodyForm,
  SigninFormBody,
};

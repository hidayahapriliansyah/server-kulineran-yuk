import { z } from 'zod';
import { IRestaurant } from '../../../../models/Restaurant';

const signupBodyForm = z.object({
  name: z.string({
      required_error: 'Nama harus diisi.',
      invalid_type_error: 'Nama harus diisi berupa string.',
    })
    .regex(/^[a-zA-Z.,_\s-']+$/, 'Silakan gunakan karakter a-z A-Z 0-9 . , _ - \'')
    .min(3, 'Nama minimal memiliki 3 karakter.')
    .max(50, 'Nama maksimal memiliki 50 karakter.'),
  username: z.string({
      required_error: 'Username harus diisi.',
      invalid_type_error: 'Username harus diisi dan berupa string.',
    })
    .regex(/^[a-z0-9._]+$/, 'Silakan gunakan karakter a-z 0-9 . _')
    .min(3, 'Username minimal memiliki 3 karakter.')
    .max(30, 'Username maksimal memiliki 30 karakter.'),
  email: z.string({
      required_error: 'Email harus diisi.',
      invalid_type_error: 'Email harus diisi dan berupa string.',
    })
    .email('Email tidak valid.')
    .max(254, 'Email maksimal memiliki 254 karakter.'),
    password: z.string({
      required_error: 'Password harus diisi.',
      invalid_type_error: 'Password harus diisi dan berupa string.',
  }).min(6, 'Password minimal memiliki 6 karakter.'),
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

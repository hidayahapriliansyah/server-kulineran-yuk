import { z } from 'zod';

const signupBodyForm = z.object({
  name: z.string({
    required_error: 'name harus diisi.',
    invalid_type_error: 'name harus berupa string.',
    })
    .regex(/^[a-zA-Z0-9.,_\s-]+$/, 'nama harus berupa karakter a-z A-Z 0-9 . , _ -')
    .min(3, 'name minimal memiliki 3 karakter.')
    .max(50, 'name maksimal memiliki 50 karakter.'),
  username: z.string({
      required_error: 'username harus diisi.',
      invalid_type_error: 'username harus berupa string.',
    })
    .regex(/^[a-z0-9._']+$/, 'username harus berupa huruf kecil, angka, titik, atau underscore')
    .min(3, 'username minimal memiliki 3 karakter.')
    .max(30, 'username maksimal memiliki 30 karakter.'),
  email: z.string({
    required_error: 'email harus diisi.',
    invalid_type_error: 'email harus berupa string.',
    })
    .email('email tidak valid.')
    .nonempty('email minimal memiliki 1 karakter.')
    .max(254, 'email maksimal memiliki 254 karakter.'),
  password: z.string({
      required_error: 'password harus diisi.',
      invalid_type_error: 'password harus berupa string.',
    })
    .min(6, 'password minimal memiliki 6 karakter.'),
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

import { z } from 'zod';

const reEmailVerificationRequestBody = z.object({
  email: z.string({
      required_error: 'email harus diisi.',
      invalid_type_error: 'email harus berupa string.',
    })
    .email('format email tidak valid.')
    .nonempty('email minimal memiliki 1 karakter.'),
});
const resetPasswordRequestBody = z.object({
  email: z.string({
      required_error: 'email harus diisi.',
      invalid_type_error: 'email harus berupa string.',
    })
    .email('format email tidak valid.')
    .nonempty('email minimal memiliki 1 karakter.'),
});
const newPasswordViaResetPasswordBody = z.object({
  password: z.string({
      required_error: 'password harus diisi.',
      invalid_type_error: 'password harus berupa string.',
    })
    .min(6, 'password minimal 6 karakter.'),
  requestId: z.string({
    required_error: 'requestId harus diisi.',
    invalid_type_error: 'requestId harus berupa string.',
  }),
});

type ReEmailVerificationRequestBody = z.infer<typeof reEmailVerificationRequestBody>;
type ResetPasswordRequestBody = z.infer<typeof resetPasswordRequestBody>;
type NewPasswordViaResetPasswordBody = z.infer<typeof newPasswordViaResetPasswordBody>;

export {
  reEmailVerificationRequestBody,
  resetPasswordRequestBody,
  newPasswordViaResetPasswordBody,
  ReEmailVerificationRequestBody,
  ResetPasswordRequestBody,
  NewPasswordViaResetPasswordBody,
};

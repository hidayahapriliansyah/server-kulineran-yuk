import { z } from 'zod';

const reEmailVerificationRequestBody = z.object({
  email: z.string().email().nonempty(),
});
const resetPasswordRequestBody = z.object({
  email: z.string().email().nonempty(),
});
const newPasswordViaResetPasswordBody = z.object({
  password: z.string().min(6).nonempty(),
  requestId: z.string(),
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
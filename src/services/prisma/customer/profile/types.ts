import { Customer } from '@prisma/client';
import { z } from 'zod';

const updateCustomerProfileBodySchema = z.object({
  avatar: z.string({
      invalid_type_error: 'Avatar harus diisi dengan url gambar avatar.',
    })
    .url('Avatar harus diisi dengan url gambar avatar.')
    .optional(),
  username: z.string({
      invalid_type_error: 'Username harus berupa string.',
    })
    .regex(/^[a-z0-9._']+$/, 'Silakan gunakan karakter a-z 0-9 . _ \'')
    .min(3, 'Username minimal memiliki 3 karakter.')
    .max(30, 'Username maksimal memiliki 30 karakter.')
    .optional(),
  name: z.string({
      invalid_type_error: 'Nama harus berupa string.',
    })
    .regex(/^[a-zA-Z.,_\s-]+$/, 'Silakan gunakan karakter a-z A-Z 0-9 . , _ -')
    .min(3, 'Nama minimal memiliki 3 karakter.')
    .max(50, 'Nama maksimal memiliki 50 karakter.')
    .optional(),
});

const updateCustomerJoinBotramMethodBodySchema = z.object({
  // joinBotram: z.enum(['directly', 'invitation', 'byself']),
  joinBotram: z.string({
      required_error: 'Status joinBotram harus diisi.',
      invalid_type_error: 'Status valid antara \'directly\', \'invitation\', \'byself\''
    })
    .refine((value) => ['DIRECTLY', 'INVITATION', 'BYSELF'].includes(value), {
      message: 'Status valid antara \'directly\', \'invitation\', \'byself\'',
    }),
});

type CustomerProfileResponse = Pick<Customer, 'id' | 'avatar' | 'username' | 'name'>;
type UpdateCustomerProfileBody = z.infer<typeof updateCustomerProfileBodySchema>;
type UpdateCustomerJoinBotramMethodBodySchema = z.infer<typeof updateCustomerJoinBotramMethodBodySchema>;

export {
  updateCustomerJoinBotramMethodBodySchema,
  updateCustomerProfileBodySchema,
  CustomerProfileResponse,
  UpdateCustomerProfileBody,
  UpdateCustomerJoinBotramMethodBodySchema,
};

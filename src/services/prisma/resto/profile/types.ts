import { z } from 'zod';

const profileBodySchema = z.object({
  avatar: z.string({
    invalid_type_error: 'avatar harus berupa string.',
  })
    .optional(),
  username: z.string({
    invalid_type_error: 'username harus berupa string.',
  })
    .regex(/^[a-z0-9._]+$/, 'username harus berupa huruf kecil, number, titik atau underscore.')
    .min(3, 'username minimal memiliki 3 karakter.')
    .max(30, 'username maksimal memiliki 30 karakter.')
    .optional(),
  name: z.string({
    invalid_type_error: 'name harus berupa string.',
  })
    .regex(/^[a-zA-Z0-9.,\s-']+$/, 'name harus berupa a-zA-Z 0-9 . , - \'')
    .min(3, 'name minimal memiliki 3 karakter.')
    .max(50, 'name maksimal memiliki 50 karakter.')
    .optional(),
  villageId: z.string({
    invalid_type_error: 'villageId harus berupa string.',
  })
    .optional(),
  locationLink: z.string({
    invalid_type_error: 'locationLink harus berupa string.',
  })
    .optional(),
  detail: z.string({
    invalid_type_error: 'detail harus berupa string.',
  })
    .max(200, 'detail maksimal memiliki 200 karakter.')
    .optional(),
  contact: z.string({
    invalid_type_error: 'contact harus berupa string.',
  })
    .max(14, 'contact maksimal memiliki 14 karakter.')
    .optional(),
  imageGallery: z.array(z.string({
    required_error: 'imageGallery item harus diisi.',
    invalid_type_error: 'imageGallery item harus berupa string.',
  }), {
    invalid_type_error: 'imageGallery harus berupa string.',
  }).optional(),
  openingHour: z.string({
    invalid_type_error: 'openingHour harus berupa string.',
  })
    .length(5, 'openingHour maksimal memiliki 5 karakter.')
    .optional(),
  closingHour: z.string({
    invalid_type_error: 'closingHour harus berupa string.',
  })
    .length(5, 'closingHour maksimal memiliki 5 karakter.')
    .optional(),
  daysOff: z.array(z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']), {
    invalid_type_error: 'daysOff harus berupa array.',
  })
    .optional(),
  fasilities: z.array(z.string({
    required_error: 'fasitilies item harus diisi.',
    invalid_type_error: 'fasitilies item harus berupa string.',
  })
    .max(100, 'fasilities item maksimal memiliki 100 karakter.'), {
    invalid_type_error: 'fasilities harus berupa array.',
  })
    .optional(),
});
type ProfileBody = z.infer<typeof profileBodySchema>;
type ProfileResponse = {
  avatar: string;
  username: string;
  name: string;
  address: {
    provinceId: string | null;
    regencyId: string | null;
    districtId: string | null;
    villageId: string | null;
    locationLink: string | null;
    detail: string | null;
  } | null,
  contact: string | null;
  imageGallery: string[] | [];
  bussinessHours: {
    openingHour: string | null;
    closingHour: string | null;
    daysOff: string[] | null;
  };
  fasilities: string[] | [];
};
type UpdateRestaurantPayload = Omit<ProfileBody, 'villageId' | 'detail' | 'imageGallery'> & {
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  image5: string;
};
type UpdateRestaurantAddressPayload = Pick<ProfileBody, 'villageId' | 'detail'>;
const setupProfileBody = z.object({
  username: z.string({
    required_error: 'usernam harus diisi.',
    invalid_type_error: 'username harus berupa string.',
  })
    .regex(/^[a-z0-9._]+$/, 'username harus berupa huruf kecil, number, titik, atau underscore')
    .min(3)
    .max(30),
  name: z.string({
    required_error: 'name harus diisi.',
    invalid_type_error: 'name harus berupa string.',
  })
    .regex(/^[a-zA-Z0-9.,\s-']+$/, 'name harus berupa a-zA-Z 0-9 . , - \'')
    .min(3, 'name minimal memiliki 3 karakter.')
    .max(50, 'name maksimal memiliki 50 karakter.'),
  password: z.string({
    required_error: 'password harus diisi.',
    invalid_type_error: 'password harus berupa string.',
  })
    .min(6, 'password minimal memiliki 6 karakter.'),
});
type SetupProfileBody = z.infer<typeof setupProfileBody>;
const updateCustomerPaymentTypeBody = z.object({
  customerPayment: z.enum(['AFTER_ORDER', 'BEFORE_ORDER']),
});
type UpdateCustomerPaymentTypeBody = z.infer<typeof updateCustomerPaymentTypeBody>;
export {
  profileBodySchema,
  ProfileBody,
  ProfileResponse,
  UpdateRestaurantPayload,
  UpdateRestaurantAddressPayload,
  setupProfileBody,
  SetupProfileBody,
  updateCustomerPaymentTypeBody,
  UpdateCustomerPaymentTypeBody,
};

import { z } from 'zod';

const profileBodySchema = z.object({
  avatar: z.string().optional(),
  username: z.string().regex(/^[a-z0-9._']+$/).min(3).max(30).optional(),
  name: z.string().regex(/^[a-zA-Z0-9.,_\s-]+$/).min(3).max(50).optional(),
  villageId: z.string().optional(),
  locationLink: z.string().optional(),
  detail: z.string().max(200).optional(),
  contact: z.string().max(14).optional(),
  imageGallery: z.array(z.string()).optional(),
  openingHour: z.string().length(5).optional(),
  closingHour: z.string().length(5).optional(),
  daysOff: z.array(z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])).optional(),
  fasilities: z.array(z.string().max(100)).optional(),
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
    openingHours: string | null;
    closingHours: string | null;
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

export {
  profileBodySchema,
  ProfileBody,
  ProfileResponse,
  UpdateRestaurantPayload,
  UpdateRestaurantAddressPayload,
};
import { z } from 'zod';
import RestaurantNotification, { IRestaurantNotification } from '../models/RestaurantNotification';

const createRestaurantNotificationParamsSchema = z.object({
  type: z.enum(['user_review', 'accepted_order']),
  restaurantId: z.string(),
  customerUsername: z.string(),
  redirectLink: z.string(),
});

type CreateRestaurantNotificationParams = z.infer<typeof createRestaurantNotificationParamsSchema>;

const createRestaurantNotification = async ({
  type,
  restaurantId,
  customerUsername,
  redirectLink,
}: CreateRestaurantNotificationParams): Promise<IRestaurantNotification['_id'] | Error> => {
  try {
    const validatedData = createRestaurantNotificationParamsSchema.parse({
      type,
      restaurantId,
      customerUsername,
      redirectLink,
    });

    let title;
    let description;
    if (validatedData.type === 'user_review') {
      title = 'Ulasan Baru!';
      description = `@${customerUsername} telah memberikan ulasan! Yuk lihat apa yang dia katakan.`;
    } else if (validatedData.type === 'accepted_order') {
      title = 'Pesanan Diterima';
      description = `Pesanan dari @${customerUsername} telah diterima. Jangan lupa buat proses pesananannya ya!`;
    }

    const restaurantNotification = await RestaurantNotification.create({
      restaurantId,
      title,
      description,
      redirectLink,
    });

    return restaurantNotification._id;
  } catch (error: any) {
    throw Error('Something when wrong due to create notification.');
  }
};

export default createRestaurantNotification;

import { Restaurant } from '@prisma/client';
import prisma from '../db';

const updateRestaurantRating = async (restaurantId: Restaurant['id']): Promise<void> => {
  const foundRestaurantReviews = await prisma.restaurantReview.findMany({
    where: { restaurantId },
  });
  if (foundRestaurantReviews.length === 0) {
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { rating: 0 },
    });
    return;
  }
  let ratingScore = 0;
  foundRestaurantReviews.map((review) => {
    ratingScore += review.rating;
  });
  const calculatedMeanRating = Number((ratingScore / foundRestaurantReviews.length).toFixed(1));
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { rating: calculatedMeanRating },
  });
};

export default updateRestaurantRating;

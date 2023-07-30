import { Request } from 'express';
import Restaurant, { IRestaurant } from '../../../models/Restaurant';
import { Unauthorized } from '../../../errors';

const getProfile = async (req: Request): Promise<IRestaurant | Error> => {
  const { _id: id } = req.user as { _id: string };

  try {
    const result = await Restaurant.findById(id);
    if (!result) {
      throw new Unauthorized('Credential Error. User is not exist');
    }
    return result;
  } catch (error) {
    throw error;
  }
};

export {
  getProfile,
};
import { Request } from 'express'
import Restaurant from '../../../models/Restaurant';

const signup = async (req: Request) => {
  const {} = req.body;

  const result = await Restaurant.create();
};

export {
  signup,
};
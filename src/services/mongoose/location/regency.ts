import { BadRequest, NotFound } from '../../../errors';
import Regency, { IRegency } from '../../../models/Regency';
import { Request } from 'express';

export interface IRegencyDTO {
  id: string;
  provinceId: string;
  regency: string;
}

const getRegency = async (req: Request): Promise<IRegencyDTO[]> => {
  const { province } = req.query;

  if(!province) {
    throw new BadRequest(`Invalid Request. Please check your input.`);
  }

  const result = await Regency.find({ provinceId: province });

  if(result.length === 0) {
    throw new NotFound(`Resource not found. Province id ${province} is not exist`);
  }

  const resultDTO: IRegencyDTO[] = result.map((regency) => ({
    id: regency.id,
    provinceId: regency.provinceId,
    regency: regency.regency,
  }));

  return resultDTO;
};

export {
  getRegency,
};

import { BadRequest, NotFound } from '../../../errors';
import District from '../../../models/District';
import { Request } from 'express';

export interface IDistrictDTO {
  id: string;
  regencyId: string;
  district: string;
}

const getDistrict = async (req: Request): Promise<IDistrictDTO[]> => {
  const { regency } = req.query;

  if(!regency) {
    throw new BadRequest(`Invalid Request. Please check your input.`);
  }

  const result = await District.find({ regencyId: regency });

  if(result.length === 0) {
    throw new NotFound(`Resource not found. regency id ${regency} is not exist`);
  }

  const resultDTO: IDistrictDTO[] = result.map((district) => ({
    id: district.id,
    regencyId: district.regencyId,
    district: district.district,
  }));

  return resultDTO;
};

export {
  getDistrict,
};

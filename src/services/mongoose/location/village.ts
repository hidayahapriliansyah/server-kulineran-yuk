import { BadRequest, NotFound } from '../../../errors';
import { Request } from 'express';
import Village from '../../../models/Village';

export interface IVillageDTO {
  id: string;
  distrcitId: string;
  village: string;
}

const getVillage = async (req: Request): Promise<IVillageDTO[]> => {
  const { district } = req.query;

  if(!district) {
    throw new BadRequest(`Invalid Request. Please check your input.`);
  }

  const result = await Village.find({ districtId: district });

  if(result.length === 0) {
    throw new NotFound(`Resource not found. district id ${district} is not exist`);
  }

  const resultDTO: IVillageDTO[] = result.map((village) => ({
    id: village.id,
    distrcitId: village.districtId,
    village: village.village,
  }));

  return resultDTO;
};

export {
  getVillage,
};

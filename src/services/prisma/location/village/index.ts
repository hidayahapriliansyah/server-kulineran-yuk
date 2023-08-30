import { Request } from 'express';
import * as DTO from './types';
import { BadRequest, NotFound } from '../../../../errors';
import prisma from '../../../../db';

const getVillage = async (req: Request): Promise<DTO.VillageResponse[] | Error> => {
  const { district } = req.query;

  if(!district) {
    throw new BadRequest('Invalid Request. district query is missing. Please check your input.');
  }

  // const result = await Village.find({ districtId: district });
  const villages = await prisma.village.findMany({
    where: {
      districtId: district as string,
    },
  });

  if(villages.length === 0) {
    throw new NotFound(`Resource not found. district id ${district} is not exist.`);
  }

  const result: DTO.VillageResponse[] = villages.map((village) => ({
    id: village.id,
    districtId: village.districtId,
    village: village.village,
  }));

  return result;
};

export {
  getVillage,
};

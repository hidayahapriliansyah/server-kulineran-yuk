import { Request } from 'express';

import * as DTO from './types';
import { BadRequest, NotFound } from '../../../../errors';
import prisma from '../../../../db';

const getDistrict = async (req: Request): Promise<DTO.districtResponse[] | Error> => {
  const { regencyId } = req.query;

  if(!regencyId) {
    throw new BadRequest('regency query is missing.');
  }

  const districts = await prisma.district.findMany({
    where: {
      regencyId: regencyId as string,
    },
  })

  if(districts.length === 0) {
    throw new NotFound(`Resource not found. regency id ${regencyId} is not exist`);
  }

  const result: DTO.districtResponse[] = districts.map((district) => ({
    id: district.id,
    regencyId: district.regencyId,
    district: district.district,
  }));

  return result;
};

export {
  getDistrict,
};

import { Request } from 'express';

import { BadRequest, NotFound } from '../../../../errors';
import * as DTO from './types';
import prisma from '../../../../db';

const getRegency = async (req: Request): Promise<DTO.RegencyResponse[] | Error> => {
  const { province } = req.query;

  if(!province) {
    throw new BadRequest('province query is missing.');
  }

  const regencies = await prisma.regency.findMany({
    where: {
      provinceId: province as string,
    }
  });

  if(regencies.length === 0) {
    throw new NotFound(`Resource not found. Province id ${province} is not exist.`);
  }
  
  const result: DTO.RegencyResponse[] =
    regencies.map((regency) => ({
      id: regency.codeId,
      provinceId: regency.provinceId,
      regency: regency.regency,
    }));

  return result;
};

export {
  getRegency,
};

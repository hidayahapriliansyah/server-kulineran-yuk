import prisma from '../../../../db';

import * as DTO from './types';

const getAllProvinces = async (): Promise<DTO.ProvinceResponse[]> => {
  const provinces = await prisma.province.findMany();

  const result: DTO.ProvinceResponse[] =
    provinces.map((province) => ({
        id: province.codeId,
        province: province.province,
      }));

  return result;
};

export {
  getAllProvinces,
};

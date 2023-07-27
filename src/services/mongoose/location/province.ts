import Province, { IProvince } from '../../../models/Province';

export interface IProvinceDTO {
  id: string;
  province: string;
}

const getAllProvinces = async (): Promise<IProvinceDTO[]> => {
  const result = await Province.find();
  const resultDTO: IProvinceDTO[] = result.map((province) => ({
    id: province.id,
    province: province.province,
  }));

  return resultDTO;
};

export {
  getAllProvinces,
};

import { CustomMenuCategoryBody } from '../../src/services/mongoose/resto/custom-menu/types';

const withSpicy: CustomMenuCategoryBody = {
  name: 'Serba Pedas',
  isBungkusAble: true,
  maxSpicy: 10,
};

const withoutSpicy: CustomMenuCategoryBody = {
  name: 'Minuman Segar',
  isBungkusAble: false,
};

export {
  withSpicy,
  withoutSpicy,
};

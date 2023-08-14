import { CustomMenuCategoryBodyDTO } from '../../src/services/mongoose/resto/custom-menu';

const withSpicy: CustomMenuCategoryBodyDTO = {
  name: 'Serba Pedas',
  isBungkusAble: true,
  maxSpicy: 10,
};

const withoutSpicy: CustomMenuCategoryBodyDTO = {
  name: 'Minuman Segar',
  isBungkusAble: false,
};

export {
  withSpicy,
  withoutSpicy,
};

import { CustomMenuCompositionBodyDTO } from '../../src/services/mongoose/resto/custom-menu';

const withSpicy: Record<string, CustomMenuCompositionBodyDTO> = {
  kerupukKakap: {
    customMenuCategoryId: 'nanti',
    name: 'Kerupuk Kakap',
    description: 'Kerupuk kakap adalah bahan seblak',
    price: 500,
    stock: 10,
    images: ['http://image.com/image1', 'http://image.com/image2', 'http://image.com/image3'],
  },
  telurAyam: {
    customMenuCategoryId: 'nanti',
    name: 'Telur ayam',
    description: 'Telur ayam enak banget dijadiin bahan seblak adalah bahan seblak',
    price: 2500,
    stock: 10,
    images: ['http://image.com/image2', 'http://image.com/image3'],
  },
  sosis: {
    customMenuCategoryId: 'nanti',
    name: 'Sosis',
    description: 'Sosi enak banget dijadiin bahan seblak adalah bahan seblak',
    price: 1500,
    stock: 10,
    images: ['http://image.com/image2', 'http://image.com/image3'],
  },
};

const withoutSpicy: Record<string, CustomMenuCompositionBodyDTO> = {
  coklatBatangan: {
    customMenuCategoryId: 'nanti',
    name: 'Cokelat Batangan',
    description: 'Coklat enak banget dijadiin toping minuman',
    price: 2000,
    stock: 10,
    images: ['http://image.com/image2', 'http://image.com/image3'],
  },
  esSerut: {
    customMenuCategoryId: 'nanti',
    name: 'Es Serut',
    description: 'Es Serut enak banget dijadiin toping minuman',
    price: 1000,
    stock: 10,
    images: ['http://image.com/image2', 'http://image.com/image3'],
  },
  susuCokelat: {
    customMenuCategoryId: 'nanti',
    name: 'Susu Cokelat',
    description: 'Susu cokelat enak banget dijadiin toping minuman',
    price: 1000,
    stock: 10,
    images: ['http://image.com/image2', 'http://image.com/image3'],
  },
};

export {
  withSpicy,
  withoutSpicy,
};

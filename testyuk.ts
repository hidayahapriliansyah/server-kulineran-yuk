interface ImageObject {
  [key: string]: string;
}

const convertArrayToObject = (imageGallery: string[]): ImageObject => {
  const imageObject: ImageObject = {};

  for (let i = 0; i < 5; i++) {
    const key = `image${i + 1}`;
    const value = imageGallery[i] || '';
    imageObject[key] = value;
  }

  return imageObject;
};

// Contoh penggunaan
const imageGallery = ['http://image.com/image1', 'http://image.com/image2'];

const result = convertArrayToObject(imageGallery);

console.log(result);
const convertImageGallery = (imageGallery: string[]): ImageObject => {
  const imageObject: ImageObject = {};

  for (let i = 0; i < 5; i++) {
    const key = `image${i + 1}`;
    const value = imageGallery[i] || '';
    imageObject[key] = value;
  }

  return imageObject;
};

export default convertImageGallery;
interface ImageObject {
  [key: string]: string | null;
}

type ConvertImageGalleryParameter = {
  arrayOfImageUrl: (string | null)[],
  maxImage: number,
};

const convertImageGallery = ({ arrayOfImageUrl, maxImage }: ConvertImageGalleryParameter)
  : ImageObject => {
    const imageObject: ImageObject = {};

    for (let i = 0; i < maxImage; i++) {
      const key = `image${i + 1}`;
      const value = arrayOfImageUrl[i] || null;
      imageObject[key] = value;
    }

    return imageObject;
  };

export default convertImageGallery;

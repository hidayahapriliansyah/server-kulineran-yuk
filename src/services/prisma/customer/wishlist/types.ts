import { Menu, Restaurant, Wishlist } from '@prisma/client';

type WishlisResponse = {
  id: Wishlist['id'];
  menu: {
    slug: Menu['slug'];
    image: Menu['image1'];
    name: Menu['name'];
    restaurant: {
      username: Restaurant['username'];
      name: Restaurant['name'];
    };
  };
}

type GetAllWishlist = {
  totalWishlist: number;
  wishlistCollection: WishlisResponse[] | [];
}

export {
  WishlisResponse,
  GetAllWishlist,
};

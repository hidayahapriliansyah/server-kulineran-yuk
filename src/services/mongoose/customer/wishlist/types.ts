import { IMenu } from '../../../../models/Menu'
import { IRestaurant } from '../../../../models/Restaurant'
import { IWishlist } from '../../../../models/Wishlist'

type WishlisResponse = {
  _id: IWishlist['_id'];
  menu: {
    slug: IMenu['slug'];
    image: IMenu['image1'];
    name: IMenu['name'];
    restaurant: {
      username: IRestaurant['username'];
      name: IRestaurant['name'];
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

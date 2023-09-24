import { Request } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import slugify from 'slugify';
import { nanoid } from 'nanoid';

import config from '../../../../../../src/config';
import Restaurant, { IRestaurant } from '../../../../../../src/models/Restaurant';
import MenuSpicyLevel from '../../../../../../src/models/MenuSpicyLevel';
import Menu, { IMenu } from '../../../../../../src/models/Menu';
import Etalase, { IEtalase } from '../../../../../../src/models/Etalase';
import {
  createEtalase, 
  createRestaurantMenu, 
  deleteEtalase, 
  deleteRestaurantMenu, 
  getAllEtalase,
  getAllRestaurantMenu, 
  getRestaurantMenuBySlug,
  updateEtalase,
  updateRestaurantMenu,
} from '../../../../../../src/services/mongoose/resto/menus';
import { BadRequest, NotFound } from '../../../../../../src/errors';
import convertImageGallery from '../../../../../../src/utils/convertImageGallery';

import * as DTO from '../../../../../../src/services/mongoose/resto/menus/types';

const mockAdminRestoUser = {
  username: 'rumahmakanenak',
  name: 'Rumah Makan Enak',
  email: 'rumahmakanenak@gmail.com',
  password: 'rumahmakanenak@gmail.com',
};

const mockValidEtalasePedas: DTO.EtalaseBody = {
  name: 'Pedas',
};

const mockValidEtalaseMinuman: DTO.EtalaseBody = {
  name: 'Minuman',
};

const mockValidMenuPedas: DTO.RestaurantMenuBody = {
  name: 'Seblak Ceker Kuah',
  description: `
    Seblak Ceker Kuah adalah makanan khas Sunda yang terbuat dari kerupuk aci, ceker ayam, dan kuah kaldu yang pedas. Seblak Ceker Kuah ini sangat cocok untuk disantap saat cuaca dingin.

    Seblak Ceker Kuah ini dibuat dengan menggunakan bahan-bahan berkualitas tinggi, sehingga rasanya sangat lezat dan gurih. Ceker ayamnya yang empuk dan kuah kaldunya yang pedas membuat Seblak Ceker Kuah ini sangat nikmat untuk disantap.

    Seblak Ceker Kuah ini juga memiliki banyak manfaat bagi kesehatan. Kerupuk acinya yang terbuat dari tepung tapioka mengandung karbohidrat yang tinggi, sehingga dapat memberikan energi bagi tubuh. Ceker ayamnya juga mengandung protein yang tinggi, sehingga dapat membantu pertumbuhan dan perkembangan tubuh. Kuah kaldunya yang pedas dapat membantu meningkatkan metabolisme tubuh dan melancarkan peredaran darah.

    Seblak Ceker Kuah ini sangat mudah untuk dijumpai di berbagai daerah di Indonesia. Namun, jika Anda ingin menikmati Seblak Ceker Kuah yang lezat dan sehat, Anda dapat membuatnya sendiri di rumah. Berikut ini adalah resep Seblak Ceker Kuah yang dapat Anda coba:

    Bahan-bahan:

    100 gram kerupuk aci
    100 gram ceker ayam
    1 liter air
    100 gram bawang merah, cincang halus
    50 gram bawang putih, cincang halus
    25 gram cabai merah keriting, cincang halus
    10 gram cabai rawit merah, cincang halus
    1 sendok teh garam
    1/2 sendok teh gula pasir
    1/4 sendok teh kaldu bubuk
    1/4 sendok teh merica bubuk
    1/4 sendok teh bawang goreng
    Cara membuat:

    Rebus ceker ayam dalam air sampai matang. Angkat dan tiriskan.
    Panaskan minyak goreng dalam wajan. Tumis bawang merah dan bawang putih sampai harum.
    Masukkan cabai merah keriting, cabai rawit merah, garam, gula pasir, kaldu bubuk, dan merica bubuk. Tumis sampai cabai layu.
    Masukkan kerupuk aci dan ceker ayam. Aduk sampai bumbu meresap.
    Tambahkan air secukupnya. Masak sampai kuah mendidih dan kerupuk aci mengembang.
    Sajikan Seblak Ceker Kuah dengan taburan bawang goreng.
    Seblak Ceker Kuah ini sangat cocok untuk disantap saat cuaca dingin. Anda juga dapat menambahkan topping lain ke dalam Seblak Ceker Kuah, seperti telur, sosis, atau bakso.z
  `,
  images: [
    'https://source.unsplash.com/900x900/water',
    'https://source.unsplash.com/900x900/water',
    'https://source.unsplash.com/900x900/water',
    'https://source.unsplash.com/900x900/water',
    'https://source.unsplash.com/900x900/water',
  ],
  etalaseId: 'sdfsdfsdfsdf',
  price: 6000,
  isBungkusAble: true,
  maxSpicy: 5,
  stock: 20,
};

const mockValidMenuMinuman: DTO.RestaurantMenuBody = {
  name: 'Jus Alpukat Coklat Hangat',
  description: `
    Jus Alpukat Coklat Hangat
    
    Jus Alpukat Coklat Hangat adalah minuman yang lezat dan sehat. Terbuat dari campuran alpukat, coklat, susu, dan gula, jus ini memiliki rasa yang manis dan creamy. Alpukat merupakan buah yang kaya akan nutrisi, seperti vitamin A, vitamin C, vitamin E, dan kalium. Coklat juga merupakan sumber antioksidan yang baik. Susu dan gula menambahkan rasa manis dan creamy pada jus ini.
    
    Jus Alpukat Coklat Hangat dapat dinikmati saat hangat atau dingin. Minuman ini cocok untuk dinikmati di pagi hari sebagai pengganti sarapan atau sebagai camilan saat sore hari. Jus ini juga dapat menjadi sumber energi yang baik untuk tubuh.
    
    Berikut adalah resep Jus Alpukat Coklat Hangat:
    
    Bahan-bahan:
    
    1 buah alpukat matang, dihaluskan
    1/2 cangkir susu
    1/4 cangkir coklat bubuk
    2 sendok makan gula pasir
    1/4 sendok teh garam
    1/4 sendok teh vanili bubuk
    Cara membuat:
    
    Campur semua bahan dalam blender.
    Blender hingga halus.
    Sajikan hangat atau dingin.
    Tips:
    
    Untuk membuat jus ini lebih sehat, gunakan susu rendah lemak atau susu tanpa lemak.
    Anda juga dapat menambahkan es batu untuk membuat jus ini lebih dingin.
    Anda dapat menambahkan topping, seperti whipped cream, cokelat chips, atau almond.
  `,
  images: [
    'https://source.unsplash.com/900x900/water',
  ],
  etalaseId: 'sdfsdfsdfsdf',
  price: 10000,
  stock: 10,
};

// testing getAllRestaurantMenu
describe('testing getAllRestaurantMenu', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await MenuSpicyLevel.deleteMany({})
    await Menu.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // should throw BadRequest if limit or page query is not number string
  it('should throw BadRequest if limit or page query is not number string', async () => {
    const req = {
      user: { _id: 'sdfsjdfhjsdfhjsfd'},
      query: {
        limit: 'stringpure',
      }
    } as unknown as Request;

    try {
      await getAllRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });
  // should throw BadRequest if isActived is not include '0' or '1'
  it('should throw BadRequest if isActived is not include \'0\' or \'1\'', async () => {
    const req = {
      user: { _id: 'sdfsjdfhjsdfhjsfd'},
      query: {
        isActive: '2',
      }
    } as unknown as Request;

    try {
      await getAllRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });
  // success
  // should give valid response with limit and page default
  it('should give valid response with limit and page default', async () => {
    // todo
    // input dulu 20 menu
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    for(let i = 1; i <= 10; i++) {
      req.body = {
        ...mockValidMenuPedas,
        etalaseId: etalasePedasId.toString(),
        name: `${mockValidMenuPedas.name} ${i}`,
      }
      await createRestaurantMenu(req);
    };
    const { _id: etalaseMinumanId } = await Etalase.create({
      restaurantId,
      ...mockValidEtalaseMinuman,
    });
    for(let i = 1; i <= 10; i++) {
      req.body = {
        ...mockValidMenuMinuman,
        etalaseId: etalaseMinumanId.toString(),
        name: `${mockValidMenuMinuman.name} ${i}`,
      };
      await createRestaurantMenu(req);
    };

    req.query = {};
    const result = await getAllRestaurantMenu(req) as DTO.GetMenusWithPaginated;
    expect(result.menus).toHaveLength(10);
    expect(result.menus[0].name).toBe(mockValidMenuPedas.name + ' 1');
    expect(result.pages).toBe(2);
    expect(result.total).toBe(20);
    // coba kasih tanpa limit dan tanpa page, harus nampilin data dari limit 10 dan page 1
  });
  // should give valid response with limit and page inputted
  it('should give valid response with limit and page inputted', async () => {
    // coba kasih limit 15 dan tanpa page, harus nampilin 15 data dan page 1
    // coba kasih tanpa limit dan page 2, harus ngasih 10 data dan page ke 2 
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    for(let i = 1; i <= 10; i++) {
      const menuPayload = {
        restaurantId,
        ...mockValidMenuPedas,
        ...(convertImageGallery({
          arrayOfImageUrl: mockValidMenuPedas.images,
          maxImage: 5,
        })),
        name: `${mockValidMenuPedas.name} ${i}`,
        etalaseId: etalasePedasId,
        slug: slugify(`${mockValidMenuPedas.name} ${i}}`) + nanoid(10),
      };
      await Menu.create(menuPayload);
    };
    const { _id: etalaseMinumanId } = await Etalase.create({
      restaurantId,
      ...mockValidEtalaseMinuman,
    });
    for(let i = 1; i <= 10; i++) {
      const menuPayload = {
        restaurantId,
        ...mockValidMenuMinuman,
        ...(convertImageGallery({
          arrayOfImageUrl: mockValidMenuMinuman.images,
          maxImage: 5,
        })),
        etalaseId: etalaseMinumanId,
        name: `${mockValidMenuMinuman.name} ${i}`,
        slug: slugify(`${mockValidMenuMinuman.name} ${i}}`) + nanoid(10),
        isActive: false,
      };
      await Menu.create(menuPayload);
    };

    req.query = { limit: '15', page: '2' };
    const result = await getAllRestaurantMenu(req) as DTO.GetMenusWithPaginated;
    expect(result.menus).toHaveLength(5);
    expect(result.menus[result.menus.length - 1].name).toBe(mockValidMenuMinuman.name + ' 10');
    expect(result.pages).toBe(2);
    expect(result.total).toBe(20);
  });
  // should give valid response with limit and page and isActive inputted
  it('should give valid response with limit and page and isActive inputted', async () => {
    // todo
    // input dulu 10 data active dan 5 data non active
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    for(let i = 1; i <= 10; i++) {      
      const menuPayload = {
        restaurantId,
        ...mockValidMenuPedas,
        ...(convertImageGallery({
          arrayOfImageUrl: mockValidMenuPedas.images,
          maxImage: 5,
        })),
        name: `${mockValidMenuPedas.name} ${i}`,
        etalaseId: etalasePedasId,
        slug: slugify(`${mockValidMenuPedas.name} ${i}}`) + nanoid(10),
      };
      await Menu.create(menuPayload);
    };
    const { _id: etalaseMinumanId } = await Etalase.create({
      restaurantId,
      ...mockValidEtalaseMinuman,
    });
    for(let i = 1; i <= 5; i++) {
      const menuPayload = {
        restaurantId,
        ...mockValidMenuMinuman,
        ...(convertImageGallery({
          arrayOfImageUrl: mockValidMenuMinuman.images,
          maxImage: 5,
        })),
        etalaseId: etalaseMinumanId,
        name: `${mockValidMenuMinuman.name} ${i}`,
        slug: slugify(`${mockValidMenuMinuman.name} ${i}}`) + nanoid(10),
        isActive: false,
      };
      await Menu.create(menuPayload);
    };

    req.query = { limit: '3', page: '2', isActive: '0' };
    const result = await getAllRestaurantMenu(req) as DTO.GetMenusWithPaginated;
    expect(result.menus).toHaveLength(2);
    expect(result.menus[result.menus.length - 1].name).toBe(mockValidMenuMinuman.name + ' 5');
    expect(result.pages).toBe(2);
    expect(result.total).toBe(5);
    // coba kasih limit 3, page 2, dan isActive false nanti harus muncul 3 data
    // coba kasih limit 4 dan page 3, isActive true nanti harus muncul 2 data
  });
});
// testing createRestaurantMenu
describe('testing createRestaurantMenu', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await MenuSpicyLevel.deleteMany({})
    await Menu.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // validation input
  // name: z.string().nonempty().min(1).max(80).regex(/^[a-zA-Z0-9.'\s-]+$/),
  // should throw zod error if name body property undefined
  it('should throw zod error if name body property undefined', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.name = undefined!;

    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if name body property has empty string
  it('should throw zod error if name body property has empty string', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });

    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.name = '';
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
    }
  });
  // should throw zod error if name body property has empty has more than 80 chars
  it('should throw zod error if name body property has empty has more than 80 chars', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });

    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.name = 'Seblak Ceker Kuah adalah makanan khas Sunda yang terbuat dari kerupuk aci, ceker ayam, dan kuah kaldu yang pedas. Seblak Ceker Kuah ini sangat cocok untuk disantap saat cuaca dingin.';
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      const result = await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('String must contain at most 80 character(s)');
    }
  });
  // should throw zod error if name body property has empty has invalid value
  it('should throw zod error if name body property has empty has invalid value', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });

    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.name = 'Seblak, sddf';
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      const result = await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('Invalid');
    }
  });
  // description: z.string().min(1).max(3000),
  // should throw zod error if description body is undefined
  it('should throw zod error if description body is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });

    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.description = undefined!;
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('description');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if description body has empty string
  it('should throw zod error if description body has empty string', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.description = '';
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('description');
      expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
    }
  });
  // should throw zod error if name body property has empty has string more than 3000 chars
  it('should throw zod error if name body property has empty has string more than 3000 chars', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.description = `
      Seblak, sebuah kelezatan yang menggoda lidah dan menguji nyali para pecinta kuliner pedas. Makanan ini bukan sekadar santapan, melainkan sebuah perjalanan rasa yang menakjubkan. Di balik cita rasa pedas yang melambung, seblak adalah cerita tentang keberanian, ketangguhan, dan kelezatan dari perpaduan bahan-bahan yang luar biasa.

      Seblak, hidangan khas Indonesia, lebih dari sekadar semangkuk mie kuah. Ini adalah karya seni kuliner yang melibatkan rasa, tekstur, dan keunikan dalam setiap suapannya. Mie kuning atau mie instan, yang menjadi bahan dasar seblak, menjadi lebih dari sekadar karbohidrat penyokong. Mie ini menjadi media bagi berbagai rempah-rempah dan bahan makanan lainnya untuk bersatu dan menghasilkan keajaiban rasa.
      
      Keunikan seblak terletak pada tingkat kepedasannya yang melegenda. Pecinta makanan pedas datang dari berbagai penjuru untuk menguji batas rasa mereka dengan mencicipi seblak. Ketika berbicara tentang seblak pedas, kita berbicara tentang tantangan, sebuah pertarungan antara keinginan untuk menikmati makanan dan nyali untuk menahan panasnya rasa cabai.
      
      Cabai, inilah bintang utama dalam persembahan rasa seblak. Cabai merah menyala, cabai rawit kecil yang penuh kepedasan, atau cabai bubuk yang memancarkan warna merah gairah. Campuran cabai ini memasok api ke dalam setiap tegukan seblak. Namun, jangan biarkan api ini menakutkanmu, sebab di dalam kepedasan seblak, kita menemukan harmoni rasa yang ajaib.
      
      Kemudian ada bahan tambahan, seperti potongan ayam yang gurih, irisan daging sapi yang lembut, atau seafood segar yang menambahkan kelezatan seblak. Tidak lupa, potongan sayuran seperti kubis, wortel, atau jagung manis yang memberikan kesegaran dan keseimbangan pada hidangan ini. Keberagaman bahan ini menciptakan lapisan rasa yang kompleks dan memikat.
      
      Namun, seblak bukan hanya tentang rasa pedas. Kombinasi rempah-rempah seperti bawang putih, bawang merah, jahe, daun jeruk, dan kemiri memberikan dimensi rasa yang mendalam. Keberanian untuk mencampurkan bahan-bahan ini dengan cermat adalah seni dari pembuatan seblak yang sesungguhnya.
      
      Tidak hanya dalam hal rasa, seblak juga memberikan kepuasan dalam hal tekstur. Mie yang kenyal, sayuran yang renyah, dan daging yang lembut bergabung menjadi satu dalam satu gigitan. Sensasi mengunyah seblak adalah perpaduan antara nikmatnya kelezatan dan kepuasan dalam menaklukkan struktur tekstur yang beragam.
      
      Seblak adalah makanan yang tidak hanya memberikan kenikmatan pada lidah, tetapi juga memberikan pengalaman berbeda bagi setiap orang yang mencicipinya. Ini adalah tentang bagaimana seblak bisa menjadi peneman dalam cuaca dingin yang meresap hingga ke tulang, atau menjadi teman yang menghangatkan di sore hari yang lelah.
      
      Tak terhitung warung atau gerobak seblak di setiap sudut kota, dari pinggir jalan hingga restoran mewah, semua menjual kelezatan ini. Namun, jangan salah, seblak yang paling lezat sering kali ditemukan di tempat-tempat yang sederhana, dengan resep rahasia yang diwariskan turun temurun.
      
      Seblak, makanan yang menantang, menggoda, dan memikat. Ini adalah hidangan yang bukan hanya tentang makanan, melainkan tentang cerita yang tercipta setiap kali kita mencicipinya. Setiap suap adalah petualangan, dan setiap mangkuk adalah perjalanan ke dalam dunia rasa yang tak terlupakan.
    `;
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('description');
      expect(error.errors[0].message).toBe('String must contain at most 3000 character(s)');
    }
  });
  // etalaseId: z.string().nonempty(),
  // should throw zod error if etalaseId body is undefined
  it('should throw zod error if etalaseId body is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.etalaseId = undefined!;
    req.body = {
      ...mockMenuPedas,
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('etalaseId');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw NotFound if etalaseId has no match with any etalase
  it('should throw NotFound if etalaseId has no match with any etalase', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.etalaseId = undefined!;
    req.body = {
      ...mockMenuPedas,
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('etalaseId');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // price: z.number().positive(),
  // should throw zod error if price body is undefined
  it('should throw zod error if price body is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.price = undefined!;
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('price');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if price body is not positive
  it('should throw zod error if price body is not positive', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.price = -1;
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('price');
      expect(error.errors[0].message).toBe('Number must be greater than 0');
    }
  });
  // images: z.array(z.string().url()),
  // should throw zod error if images body property is undefined
  it('should throw zod error if images body property is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.images = undefined!;
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('images');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if images body property is array but has 0 string
  it('should throw zod error if images body property is array but has 0 string', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.images = [];
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('images');
      expect(error.errors[0].message).toBe('Array must contain at least 1 element(s)');
    }
  });
  // should throw zod error if images body property is array but only has more than 5 string
  it('should throw zod error if images body property is array but only has more than 5 string', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.images = [
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
    ];
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    try {
      expect(await createRestaurantMenu(req)).toThrow(ZodError);
      await createRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('images');
      expect(error.errors[0].message).toBe('Array must contain at most 5 element(s)');
    }
  });
  // success
  // should create menu with MenuSpicyLevel data
  it('should create menu with MenuSpicyLevel data', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const mockMenuPedas = { ...mockValidMenuPedas };
    mockMenuPedas.images = [
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
    ];
    mockMenuPedas.maxSpicy = 5;
    req.body = {
      ...mockMenuPedas,
      etalaseId: etalasePedasId.toString(),
    };
    const menu = await createRestaurantMenu(req) as IMenu['_id'];
    const menuSpicyLevel = await MenuSpicyLevel.findOne({ menuId: menu });
    expect(menuSpicyLevel).toHaveProperty('_id');
    expect(menuSpicyLevel!.maxSpicy).toBe(mockMenuPedas.maxSpicy);
  });
  // should create menu without MenuSpicyLevel data
  it('should create menu without MenuSpicyLevel data', async () => {
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalaseMinuman
    });
    const mockMenuMinuman = { ...mockValidMenuMinuman };
    mockMenuMinuman.images = [
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
      'https://source.unsplash.com/900x900',
    ];
    req.body = {
      ...mockMenuMinuman,
      etalaseId: etalasePedasId.toString(),
    };
    const menu = await createRestaurantMenu(req) as IMenu['_id'];
    const menuSpicyLevel = await MenuSpicyLevel.findOne({ menuId: menu });
    expect(menuSpicyLevel).toBeNull();
  });
});
// testing getRestaurantMenuBySlug
describe('testing getRestaurantMenuBySlug', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);

    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
      body: {},
      params: {},
    } as unknown as Request;
    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const menuPedasPayload = {
      ...mockValidMenuPedas,
      restaurantId,
      etalaseId: etalasePedasId.toString(),
    };
    req.body = menuPedasPayload;
    await createRestaurantMenu(req);

    const { _id: etalaseMinumanId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalaseMinuman,
    });
    const menuMinumanPayload = {
      ...mockValidMenuMinuman,
      restaurantId,
      etalaseId: etalaseMinumanId.toString(),
    };
    req.body = menuMinumanPayload;
    await createRestaurantMenu(req);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await MenuSpicyLevel.deleteMany({});
    await Menu.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // should throw error NotFound if slug menu is not found
  it('should throw error NotFound if slug menu is not found', async () => {
    // todo
    // input dulu 10 data active dan 5 data non active
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });    
    const menuPayload = {
      restaurantId,
      ...mockValidMenuPedas,
      ...(convertImageGallery({
        arrayOfImageUrl: mockValidMenuPedas.images,
        maxImage: 5,
      })),
      name: 'mockValidMenuPedas.nam',
      etalaseId: etalasePedasId,
      slug: slugify(mockValidMenuPedas.name) + nanoid(10),
    };
    await Menu.create(menuPayload);

    req.params = { slug: 'selbkasdfsdfjsdkf' };
    try {
      expect((await getRestaurantMenuBySlug(req)))
        .toThrow(new NotFound('Menu slug not found. Please input valid menu slug.'));
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
    }
  });
  // success
  // should resepon menu with maxSpicy is null
  it('should response menu with maxSpicy is null', async () => {    
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuMinuman = await Menu.findOne({
      name: {
        $regex: mockValidMenuMinuman.name,
      },
    });
    const { slug: menuMinumanSlug } = menuMinuman!;
    const req = {
      user: { _id: restaurantId },
      params: { 
        slug: menuMinumanSlug,
      },
    } as unknown as Request;
    const findMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    expect(findMenu.name).toBe(mockValidMenuMinuman.name);
    expect(findMenu.description).toBe(mockValidMenuMinuman.description);
    expect(mongoose.Types.ObjectId.isValid(findMenu.etalaseId))
      .toBe(true);
    expect(findMenu.images).toStrictEqual([...mockValidMenuMinuman.images, '', '', '', '']);
    expect(findMenu.isBungkusAble).toBe(false);
    expect(findMenu.price).toBe(mockValidMenuMinuman.price);
    expect(findMenu.stock).toBe(mockValidMenuMinuman.stock);
    expect(findMenu.maxSpicy).toBeNull();
  });
  // should resepon menu with maxSpicy is number
  it('should response menu with maxSpicy is number', async () => {    
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { slug: menuPedasSlug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { 
        slug: menuPedasSlug,
      },
    } as unknown as Request;
    const findMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    expect(findMenu.name).toBe(mockValidMenuPedas.name);
    expect(findMenu.description).toBe(mockValidMenuPedas.description);
    expect(mongoose.Types.ObjectId.isValid(findMenu.etalaseId)).toBe(true);
    expect(findMenu.images.length).toBe(5);
    expect(findMenu.images).toStrictEqual([...mockValidMenuPedas.images]);
    expect(findMenu.isBungkusAble).toBe(mockValidMenuPedas.isBungkusAble);
    expect(findMenu.price).toBe(mockValidMenuPedas.price);
    expect(findMenu.stock).toBe(mockValidMenuPedas.stock);
    expect(findMenu.maxSpicy).toBe(mockValidMenuPedas.maxSpicy);
  });
});
// testing updateRestaurantMenu
describe('testing updateRestaurantMenu', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);

    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
      body: {},
      params: {},
    } as unknown as Request;
    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const menuPedasPayload = {
      ...mockValidMenuPedas,
      restaurantId,
      etalaseId: etalasePedasId.toString(),
    };
    req.body = menuPedasPayload;
    await createRestaurantMenu(req);

    const { _id: etalaseMinumanId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalaseMinuman,
    });
    const menuMinumanPayload = {
      ...mockValidMenuMinuman,
      restaurantId,
      etalaseId: etalaseMinumanId.toString(),
    };
    req.body = menuMinumanPayload;
    await createRestaurantMenu(req);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await MenuSpicyLevel.deleteMany({})
    await Menu.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // should throw error BadRequest if menuId param is undefined
  it('should throw error BadRequest if menuId param is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: Omit<DTO.RestaurantMenuBody, 'name'> = {
      description: foundMenu.description,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(BadRequest);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.message).toBe('Invalid Request. MenuId is undefined. Please check your input data.');
    }
  });
  // validation input
  it('should throw zod error if name body property undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: Omit<DTO.RestaurantMenuBody, 'name'> = {
      description: foundMenu.description,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // name: z.string().nonempty().min(1).max(80).regex(/^[a-zA-Z0-9.'\s-]+$/),
  it('should throw zod error if name body property is not valid regex', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      name: foundMenu.name + ',',
      description: foundMenu.description,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('Invalid');
    }
  });
  // should throw zod error if name body property has empty string
  it('should throw zod error if name body property has empty string', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      name: '',
      description: foundMenu.description,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
    }
  });
  // should throw zod error if name body property has empty has more than 80 chars
  it('should throw zod error if name body property has empty has more than 80 chars', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      name: foundMenu.description,
      description: foundMenu.description,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('String must contain at most 80 character(s)');
    }
  });
  // should throw zod error if description body is undefined
  it('should throw zod error if description body property undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: Omit<DTO.RestaurantMenuBody, 'description'> = {
      name: foundMenu.name,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('description');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if description body has empty string
  it('should throw zod error if description body has empty string', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      description: '',
      name: foundMenu.name,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('description');
      expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
    }
  });
  // should throw zod error if name body property has empty has string more than 3000 chars
  it('should throw zod error if name body property has empty has string more than 3000 chars', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      description: foundMenu.description + foundMenu.description,
      name: foundMenu.name,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('description');
      expect(error.errors[0].message).toBe('String must contain at most 3000 character(s)');
    }
  });
  // etalaseId: z.string().nonempty(),
  it('should throw NotFound if etalaseId is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: Omit<DTO.RestaurantMenuBody, 'etalaseId'> = {
      description: foundMenu.description,
      name: foundMenu.name,
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('etalaseId');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw NotFound if etalaseId has no match with any etalase
  it('should throw NotFound if etalaseId has no match with any etalase', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      description: foundMenu.description,
      name: foundMenu.name,
      etalaseId: 'sdfsdfsdfsdsdsdf',
      images: foundMenu.images,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(NotFound);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
    }
  });
  // should throw zod error if price body is undefined
  it('should throw zod error if price body is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: Omit<DTO.RestaurantMenuBody, 'price'> = {
      description: foundMenu.description,
      name: foundMenu.name,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('price');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if price body is not positive
  it('should throw zod error if price body is not positive', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      description: foundMenu.description,
      name: foundMenu.name,
      etalaseId: foundMenu.etalaseId,
      images: foundMenu.images,
      price: -1,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('price');
      expect(error.errors[0].message).toBe('Number must be greater than 0');
    }
  });
  // images: z.array(z.string()),
  // should throw zod error if images body property is undefined
  it('should throw zod error if images body property is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: Omit<DTO.RestaurantMenuBody, 'images'> = {
      name: foundMenu.name,
      etalaseId: foundMenu.etalaseId,
      description: foundMenu.description,
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('images');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if images body property is array but only has 0 string url
  it('should throw zod error if images body property is array but only has 0 string url', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      name: foundMenu.name,
      etalaseId: foundMenu.etalaseId,
      description: foundMenu.description,
      images: [],
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('images');
      expect(error.errors[0].message).toBe('Array must contain at least 1 element(s)');
    }
  });
  // should throw zod error if images body property is array but has more than 5 string url
  it('should throw zod error if images body property is array but has more than 5 string url', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const { _id: menuId, slug } = menuPedas!;
    const req = {
      user: { _id: restaurantId },
      params: { slug, menuId },
      body: {},
    } as unknown as Request;

    const foundMenu = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      name: foundMenu.name,
      etalaseId: foundMenu.etalaseId,
      description: foundMenu.description,
      images: [
        ...foundMenu.images,
        'http://src.image.com',
      ],
      price: foundMenu.price,
      isBungkusAble: foundMenu.isBungkusAble,
      maxSpicy: foundMenu.maxSpicy,
      stock: foundMenu.stock,
    };
    req.body = updatedMenuBody;

    await expect(() => updateRestaurantMenu(req)).rejects.toThrow(ZodError);
    try {
      await updateRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('images');
      expect(error.errors[0].message).toBe('Array must contain at most 5 element(s)');
    }
  });
  // success
  // change menu with speciy to have no spicy level 
  it('should change menu with speciy to have no spicy level', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const menuPedas = await Menu.findOne({
      name: {
        $regex: mockValidMenuPedas.name,
      },
    });
    const menuMinuman = await Menu.findOne({
      name: {
        $regex: mockValidMenuMinuman.name,
      },
    });
    const { _id: menuPedasId } = menuPedas!;
    const { slug: slugMenuMinuman } = menuMinuman!;
    const req = {
      user: { _id: restaurantId },
      params: { slug: slugMenuMinuman, menuId: menuPedasId },
      body: {},
    } as unknown as Request;

    const foundMenuMinuman = await getRestaurantMenuBySlug(req) as DTO.RestaurantMenuResponse;
    const updatedMenuBody: DTO.RestaurantMenuBody = {
      name: foundMenuMinuman.name,
      description: foundMenuMinuman.description,
      etalaseId: foundMenuMinuman.etalaseId,
      images: foundMenuMinuman.images,
      price: foundMenuMinuman.price,
      isBungkusAble: foundMenuMinuman.isBungkusAble,
      stock: foundMenuMinuman.stock,
    };
    req.body = updatedMenuBody;

    const menuPedasUpdateToMenuMinuman = await updateRestaurantMenu(req);
    const spicyLevelExist = await MenuSpicyLevel.findOne({ menuId: menuPedasId });
    expect(spicyLevelExist).toBeNull();
  });
  // change menu without speciy to have spicy level
});
// testing deleteRestaurantMenu
describe('testing deleteRestaurantMenu', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);

    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const req = {
      user: { _id: restaurantId },
      body: {},
    } as unknown as Request;
    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas,
    });
    const menuPedasPayload = {
      ...mockValidMenuPedas,
      restaurantId,
      etalaseId: etalasePedasId.toString(),
    };
    req.body = menuPedasPayload;
    await createRestaurantMenu(req);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await MenuSpicyLevel.deleteMany({})
    await Menu.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // should throw error BadRequest if menuId param is undefined
  it('should throw error BadRequest if menuId param is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    
    const req = {
      user: { _id: restaurantId },
      params: {},
    } as unknown as Request;

    await expect(() => deleteRestaurantMenu(req)).rejects.toThrow(BadRequest);

    try {
      await deleteRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.message).toBe('Invalid Request. MenuId is undefined. Please check your input data.');
    }
  });
  // should throw error NotFound if menuId is not match with any menu data
  it('should throw error NotFound if menuId is not match with any menu data', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    
    const req = {
      user: { _id: restaurantId },
      params: {
        menuId: 'sdfsdfsdfafasdf',
      },
    } as unknown as Request;

    await expect(() => deleteRestaurantMenu(req)).rejects.toThrow(NotFound);

    try {
      await deleteRestaurantMenu(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
      expect(error.message).toBe('Menu Id not found. Please input valid id menu.');
    }
  });
  // success
  // should response IMenu['_id] and delete menuSpicyLevel if menu has maxSpicy
  it('should response IMenu[\'_id\'] and delete menuSpicyLevel if menu has maxSpicy', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const { _id: menuId } = await Menu.findOne() as IMenu;

    const req = {
      user: { _id: restaurantId },
      params: {
        menuId,
      },
    } as unknown as Request;

    const menuHasSpicyLevel = await MenuSpicyLevel.findOne({ menuId });
    expect(menuHasSpicyLevel!.maxSpicy).toBe(mockValidMenuPedas.maxSpicy);
    const deletedMenu = await deleteRestaurantMenu(req);
    expect(mongoose.Types.ObjectId.isValid(deletedMenu.toString())).toBe(true);
    expect(MenuSpicyLevel.findOne({ menuId: deletedMenu })).resolves.toBeNull();
  });
});
// testing getAllEtalase
describe('testing getAllEtalase', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);

    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    await Etalase.create({ 
      restaurantId,
      ...mockValidEtalaseMinuman,
    });
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // error
    // 
  // success
  // should response array (DTO.EtalaseResponse[]) with value
  it('should response array (DTO.EtalaseResponse[]) with value', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const etalases = await getAllEtalase(req) as DTO.EtalaseResponse[];
    expect(etalases).toHaveLength(2);
    expect(etalases[0].name).toBe(mockValidEtalasePedas.name);
  });
  // should response empty array (DTO.EtalaseResponse[])
  it('should response empty array (DTO.EtalaseResponse[])', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    await Etalase.deleteMany({});
    const req = {
      user: { _id: restaurantId },
    } as unknown as Request;

    const etalases = await getAllEtalase(req) as DTO.EtalaseResponse[];
    expect(etalases).toHaveLength(0);
  });
});
// testing createEtalase
describe('testing createEtalase', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);

    await Restaurant.create(mockAdminRestoUser);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // should throw zod error if name body property is undefined
  it('should throw zod error if name body property is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: { _id: restaurantId },
      body: {},
    } as unknown as Request;

    await expect(() => createEtalase(req)).rejects.toThrow(ZodError);

    try {
      await createEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if name body property is empty string
  it('should throw zod error if name body property is empty string', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: { _id: restaurantId },
      body: { name: '' },
    } as unknown as Request;

    await expect(() => createEtalase(req)).rejects.toThrow(ZodError);

    try {
      await createEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
    }
  });
  // should throw zod error if name body property has more than 20 chars
  it('should throw zod error if name body property has more than 20 chars', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: { _id: restaurantId },
      body: { name: 'dfghdfgdfgdfgdfgdfgdfgdfgrty54y54tertg45ey54tgrfgfgdfgfg' },
    } as unknown as Request;

    await expect(() => createEtalase(req)).rejects.toThrow(ZodError);

    try {
      await createEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('String must contain at most 20 character(s)');
    }
  });
  // success
  // should give response with valid data
  it('should give response with valid data', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const etalaseBody = {
      name: 'Pedas',
    }
    const req = {
      user: { _id: restaurantId },
      body: { name: etalaseBody.name },
    } as unknown as Request;

    const createdEtalase = await createEtalase(req) as IEtalase['_id'];
    expect(mongoose.Types.ObjectId.isValid(createdEtalase.toString())).toBe(true);
  });
});
// testing updateEtalase
describe('testing updateEtalase', () => {
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);

    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // error
  // should throw error BadRequest if etalaseId param is undefined
  it('should throw error BadRequest if etalaseId param is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: { _id: restaurantId },
      params: {},
    } as unknown as Request;

    await expect(() => updateEtalase(req)).rejects.toThrow(BadRequest);

    try {
      await updateEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });
  // should throw error NotFound if etalaseId is not found
  it('should throw error NotFound if etalaseId is not found', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: { _id: restaurantId },
      params: {
        etalaseId: 'sdfsdfsdfsdfsdfsdf',
      },
      body: { name: 'Etalase Baru' },
    } as unknown as Request;

    await expect(() => updateEtalase(req)).rejects.toThrow(NotFound);

    try {
      await updateEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFound);
    }
  });
  // should throw zod error if name body property is undefined
  it('should throw zod error if name body property is undefined', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const { _id: etalaseId } = await Etalase.findOne() as IEtalase;
    const req = {
      user: { _id: restaurantId },
      params: {
        etalaseId,
      },
      body: {},
    } as unknown as Request;

    await expect(() => updateEtalase(req)).rejects.toThrow(ZodError);

    try {
      await updateEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('Required');
    }
  });
  // should throw zod error if name body property is empty string
  it('should throw zod error if name body property is empty string', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const { _id: etalaseId } = await Etalase.findOne() as IEtalase;
    const req = {
      user: { _id: restaurantId },
      params: {
        etalaseId,
      },
      body: {
        name: '',
      },
    } as unknown as Request;

    await expect(() => updateEtalase(req)).rejects.toThrow(ZodError);

    try {
      await updateEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('String must contain at least 1 character(s)');
    }
  });
  // should throw zod error if name body property has more than 20 chars
  it('should throw zod error if name body property has more than 20 chars', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const { _id: etalaseId } = await Etalase.findOne() as IEtalase;
    const req = {
      user: { _id: restaurantId },
      params: {
        etalaseId,
      },
      body: {
        name: 'sdfsdfgsdfgsdfgsdfsdfsdfsdfsdfsdfsdf',
      },
    } as unknown as Request;

    await expect(() => updateEtalase(req)).rejects.toThrow(ZodError);

    try {
      await updateEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors[0].path[0]).toBe('name');
      expect(error.errors[0].message).toBe('String must contain at most 20 character(s)');
    }
  });
  // success
  // should give response with valid data
  it('should give response with valid data', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const { _id: etalaseId } = await Etalase.findOne() as IEtalase;
    const req = {
      user: { _id: restaurantId },
      params: {
        etalaseId,
      },
      body: {
        name: 'Etalase Pedas waw',
      },
    } as unknown as Request;

    const updatedEtalase = await updateEtalase(req) as IEtalase['_id'];
    expect(mongoose.Types.ObjectId.isValid(updatedEtalase.toString())).toBe(true);
  });
});
// testing deleteEtalase
describe('testing deleteEtalase', () => { 
  // error
  // should throw error BadRequest if etalaseId param is undefined
  beforeEach(async () => {
    await mongoose.connect(config.urlDb);
    const { _id: restaurantId } = await Restaurant.create(mockAdminRestoUser);
    const { _id: etalasePedasId } = await Etalase.create({ 
      restaurantId,
      ...mockValidEtalasePedas
    });
    const req = {
      user: { _id: restaurantId },
      body: {
        ...mockValidMenuPedas,
        restaurantId,
        etalaseId: etalasePedasId.toString(), },
    } as unknown as Request;
    await createRestaurantMenu(req);
  });
  afterEach(async () => {
    await Restaurant.deleteMany({});
    await Etalase.deleteMany({});
    await mongoose.connection.close();
  });
  // should throw error NotFound if etalaseId no match with any etalase data
  it('should throw error NotFound if etalaseId no match with any etalase data', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;

    const req = {
      user: { _id: restaurantId },
      params: {},
    } as unknown as Request;

    await expect(() => deleteEtalase(req)).rejects.toThrow(BadRequest);

    try {
      await deleteEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
    }
  });
  // should throw erro BadRequest if etalase has menu
  it('should throw erro BadRequest if etalase has menu', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const { _id: etalaseId } = await Etalase.findOne() as IEtalase;
    const req = {
      user: { _id: restaurantId },
      params: { etalaseId },
    } as unknown as Request;

    const menuWithThisEtalaseExist = await Menu.findOne({ etalaseId });
    expect(menuWithThisEtalaseExist).toBeTruthy();
    await expect(() => deleteEtalase(req)).rejects.toThrow(BadRequest);
    try {
      await deleteEtalase(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(BadRequest);
      expect(error.message).toBe('Etalase has at least one menu. Etalase can not be deleted. Please make sure etalase is empty to delete it.');
    }
  });
  // success
  // should delete etalase and give response with etalase id 
  it('should delete etalase and give response with etalase id ', async () => {
    const { _id: restaurantId } = await Restaurant.findOne() as IRestaurant;
    const { _id: etalaseId } = await Etalase.findOne() as IEtalase;
    await Menu.deleteMany({});
    const req = {
      user: { _id: restaurantId },
      params: { etalaseId },
    } as unknown as Request;
    const deletedEtalase = await deleteEtalase(req);
    expect(mongoose.Types.ObjectId.isValid(deletedEtalase.toString())).toBe(true);
  });
});

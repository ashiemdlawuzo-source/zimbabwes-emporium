import { Product, Seller, HUBS } from './types';

const SEED_SELLERS: Seller[] = [
  {
    id: 'seller-ok-zim',
    name: 'OK Zimbabwe Supermarket',
    type: 'big_shop',
    bio: 'One of Zimbabwe\u2019s largest retail chains. Fresh groceries, household goods, and more — now accepting Pi.',
    avatar: 'https://images.pexels.com/photos/36943007/pexels-photo-36943007.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'harare',
    phone: '+263 77 123 4567',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'seller-amai-grace',
    name: "Amai Grace's Tuckshop",
    type: 'tuckshop',
    bio: 'Your neighborhood tuckshop in Mbare. Airtime, snacks, and fresh veggies daily.',
    avatar: 'https://images.pexels.com/photos/15170758/pexels-photo-15170758.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'harare',
    phone: '+263 78 234 5678',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'seller-bulawayo-fabrics',
    name: 'Bulawayo Fabrics & Textiles',
    type: 'big_shop',
    bio: 'Colorful fabrics and textiles sourced from across the region. Quality you can feel.',
    avatar: 'https://images.pexels.com/photos/8655023/pexels-photo-8655023.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'bulawayo',
    phone: '+263 29 345 6789',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
  {
    id: 'seller-tendai-crafts',
    name: 'Tendai Handicrafts',
    type: 'individual',
    bio: 'Handmade baskets, pots, and crafts from Mutare. Each piece tells a story.',
    avatar: 'https://images.pexels.com/photos/20362433/pexels-photo-20362433.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'mutare',
    phone: '+263 77 456 7890',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'seller-gweru-maize',
    name: 'Gweru Grain Depot',
    type: 'tuckshop',
    bio: 'Quality maize meal and grains straight from the Midlands. Affordable Pi prices.',
    avatar: 'https://images.pexels.com/photos/15148672/pexels-photo-15148672.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'gweru',
    phone: '+263 78 567 8901',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'seller-chipo-produce',
    name: 'Chipo\u2019s Fresh Produce',
    type: 'individual',
    bio: 'Farm-fresh vegetables from Masvingo. Harvested daily, delivered via hub escrow.',
    avatar: 'https://images.pexels.com/photos/33624058/pexels-photo-33624058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'masvingo',
    phone: '+263 77 678 9012',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'seller-harare-tech',
    name: 'Harare Tech Hub',
    type: 'big_shop',
    bio: 'Premium electronics and gadgets in Harare. Phones, TVs, laptops, and Starlink kits — all GCV-verified.',
    avatar: 'https://images.pexels.com/photos/11129922/pexels-photo-11129922.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'harare',
    phone: '+263 77 111 2222',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'seller-bulawayo-appliances',
    name: 'Bulawayo Home Appliances',
    type: 'big_shop',
    bio: 'Quality home appliances delivered across Zimbabwe. Fridges, stoves, washing machines, and more.',
    avatar: 'https://images.pexels.com/photos/6835157/pexels-photo-6835157.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'bulawayo',
    phone: '+263 29 333 4444',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
  },
  {
    id: 'seller-mutare-essentials',
    name: 'Mutare Essentials Depot',
    type: 'tuckshop',
    bio: 'Solar panels, water tanks, motorbikes — everything you need to power, store, and move in Zimbabwe.',
    avatar: 'https://images.pexels.com/photos/29206488/pexels-photo-29206488.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'mutare',
    phone: '+263 20 555 6666',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: 'seller-zim-property',
    name: 'Zim Property Connect',
    type: 'real_estate',
    bio: 'Trusted property listings across Zimbabwe. Stands, cottages, and commercial space — reserve with Pi, transfer via Deeds Office.',
    avatar: 'https://images.pexels.com/photos/39197674/pexels-photo-39197674.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'bulawayo',
    phone: '+263 77 777 8888',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },
  {
    id: 'seller-harare-property',
    name: 'Harare Property Hub',
    type: 'real_estate',
    bio: 'Harare CBD and greater Harare property specialists. Commercial and residential space available for Pi deposit.',
    avatar: 'https://images.pexels.com/photos/2014342/pexels-photo-2014342.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    hub: 'harare',
    phone: '+263 24 999 0000',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 11,
  },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    stockQuantity: 50,
    sellerId: 'seller-ok-zim',
    name: 'Fresh Tomatoes — 5kg Box',
    description: 'Ripe, juicy tomatoes straight from the farm. Perfect for cooking or salads. GCV-verified quality.',
    pricePi: 0.0000159,
    image: 'https://images.pexels.com/photos/15170758/pexels-photo-15170758.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Fresh Market',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'prod-2',
    stockQuantity: 35,
    sellerId: 'seller-ok-zim',
    name: 'Assorted Vegetables Bundle',
    description: 'Bell peppers, broccoli, cauliflower and more. A week\u2019s worth of veggies for the family.',
    pricePi: 0.0000318,
    image: 'https://images.pexels.com/photos/33624058/pexels-photo-33624058.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Fresh Market',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'prod-3',
    stockQuantity: 30,
    sellerId: 'seller-ok-zim',
    name: 'Mixed Produce Crate (10kg)',
    description: 'Large crate of assorted fresh produce. Great value for restaurants and large families.',
    pricePi: 0.0000637,
    image: 'https://images.pexels.com/photos/36943007/pexels-photo-36943007.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Fresh Market',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'prod-4',
    stockQuantity: 60,
    sellerId: 'seller-amai-grace',
    name: 'Fresh Produce Daily Mix',
    description: 'Whatever\u2019s fresh today from Amai Grace\u2019s tuckshop. Seasonal vegetables at fair Pi prices.',
    pricePi: 0.0000095,
    image: 'https://images.pexels.com/photos/31162582/pexels-photo-31162582.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Fresh Market',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'prod-5',
    stockQuantity: 80,
    sellerId: 'seller-bulawayo-fabrics',
    name: 'Premium African Fabric — 6 yards',
    description: 'Vibrant African print fabric, 6 yards. Perfect for dresses, shirts, and traditional wear.',
    pricePi: 1.5,
    image: 'https://images.pexels.com/photos/8655023/pexels-photo-8655023.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'bulawayo',
    category: 'Fabrics & Clothing',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: 'prod-6',
    stockQuantity: 45,
    sellerId: 'seller-bulawayo-fabrics',
    name: 'Colorful Fabric Bundle (3 pieces)',
    description: 'Three assorted African fabric pieces. Mix of bold patterns and colors.',
    pricePi: 3.0,
    image: 'https://images.pexels.com/photos/35633192/pexels-photo-35633192.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: false,
    hub: 'bulawayo',
    category: 'Fabrics & Clothing',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'prod-7',
    stockQuantity: 30,
    sellerId: 'seller-bulawayo-fabrics',
    name: 'Traditional Print Fabric Roll',
    description: 'Full roll of traditional African print. Ideal for tailors and designers.',
    pricePi: 5.0,
    image: 'https://images.pexels.com/photos/38487457/pexels-photo-38487457.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'bulawayo',
    category: 'Fabrics & Clothing',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'prod-8',
    stockQuantity: 50,
    sellerId: 'seller-tendai-crafts',
    name: 'Handmade Clay Pot Set',
    description: 'Set of 3 handcrafted clay pots. Each one uniquely made by Tendai in Mutare.',
    pricePi: 0.6,
    image: 'https://images.pexels.com/photos/20362433/pexels-photo-20362433.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'mutare',
    category: 'Handicrafts',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
  {
    id: 'prod-9',
    stockQuantity: 70,
    sellerId: 'seller-tendai-crafts',
    name: 'Woven Basket — Large',
    description: 'Beautifully woven traditional basket. Perfect for storage or decoration.',
    pricePi: 0.4,
    image: 'https://images.pexels.com/photos/31653080/pexels-photo-31653080.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'mutare',
    category: 'Handicrafts',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'prod-10',
    stockQuantity: 40,
    sellerId: 'seller-tendai-crafts',
    name: 'Colorful Basket Collection (3)',
    description: 'Set of 3 woven baskets in different sizes and patterns. A great gift.',
    pricePi: 1.0,
    image: 'https://images.pexels.com/photos/32879941/pexels-photo-32879941.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: false,
    hub: 'mutare',
    category: 'Handicrafts',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: 'prod-11',
    stockQuantity: 80,
    sellerId: 'seller-gweru-maize',
    name: 'Maize Meal — 10kg Bag',
    description: 'Quality ground maize meal for sadza. A staple for every Zimbabwean household.',
    pricePi: 0.5,
    image: 'https://images.pexels.com/photos/15148672/pexels-photo-15148672.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'gweru',
    category: 'Groceries & Food',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'prod-12',
    stockQuantity: 55,
    sellerId: 'seller-gweru-maize',
    name: 'Fresh Corn Cobs (20)',
    description: '20 fresh corn cobs, straight from the Midlands fields. Great for roasting or boiling.',
    pricePi: 0.25,
    image: 'https://images.pexels.com/photos/5822353/pexels-photo-5822353.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: false,
    hub: 'gweru',
    category: 'Groceries & Food',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'prod-13',
    stockQuantity: 40,
    sellerId: 'seller-chipo-produce',
    name: 'Farm Fresh Veggie Box',
    description: 'Seasonal vegetables harvested daily from Chipo\u2019s garden in Masvingo.',
    pricePi: 0.0000111,
    image: 'https://images.pexels.com/photos/37903939/pexels-photo-37903939.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'masvingo',
    category: 'Fresh Market',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'prod-14',
    stockQuantity: 45,
    sellerId: 'seller-chipo-produce',
    name: 'Boiled Corn Bundle (10)',
    description: '10 cobs of freshly boiled corn. A quick snack, ready to eat.',
    pricePi: 0.0000047,
    image: 'https://images.pexels.com/photos/14277621/pexels-photo-14277621.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'masvingo',
    category: 'Fresh Market',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  // ── ELECTRONICS ──
  {
    id: 'prod-15',
    stockQuantity: 30,
    sellerId: 'seller-harare-tech',
    name: 'iPhone 15 Pro Max — 256GB',
    description: 'Brand new iPhone 15 Pro Max, 256GB. Titanium frame, A17 Pro chip, 48MP camera. Sealed in box with warranty.',
    pricePi: 0.0035,
    image: 'https://images.pexels.com/photos/18525574/pexels-photo-18525574.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Electronics',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'prod-16',
    stockQuantity: 35,
    sellerId: 'seller-harare-tech',
    name: 'Samsung 65" QLED Smart TV',
    description: '65-inch Samsung QLED 4K Smart TV. Built-in apps, WiFi, crystal clear display. Perfect for your lounge.',
    pricePi: 0.0025,
    image: 'https://images.pexels.com/photos/5202925/pexels-photo-5202925.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Electronics',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'prod-17',
    stockQuantity: 40,
    sellerId: 'seller-harare-tech',
    name: 'Starlink Standard Kit',
    description: 'Complete Starlink satellite internet kit with dish, router, and cable. High-speed internet anywhere in Zimbabwe.',
    pricePi: 0.0019,
    image: 'https://images.pexels.com/photos/37166577/pexels-photo-37166577.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'bulawayo',
    category: 'Electronics',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  // ── APPLIANCES ──
  {
    id: 'prod-19',
    stockQuantity: 30,
    sellerId: 'seller-bulawayo-appliances',
    name: 'Defy Double Door Fridge 300L',
    description: 'Defy 300L double door refrigerator. Frost-free, energy efficient, spacious freezer. Perfect family fridge.',
    pricePi: 0.0022,
    image: 'https://images.pexels.com/photos/6835157/pexels-photo-6835157.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'bulawayo',
    category: 'Appliances',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'prod-20',
    stockQuantity: 45,
    sellerId: 'seller-bulawayo-appliances',
    name: '5-Plate Gas Stove with Oven',
    description: '5-burner gas stove with built-in oven. Perfect for cooking large family meals. Auto-ignition, safety valves.',
    pricePi: 0.0012,
    image: 'https://images.pexels.com/photos/36575095/pexels-photo-36575095.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'bulawayo',
    category: 'Appliances',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'prod-21',
    stockQuantity: 35,
    sellerId: 'seller-bulawayo-appliances',
    name: 'Defy 10kg Washing Machine',
    description: 'Defy 10kg capacity front-load washing machine. 15 wash programs, energy efficient, quiet operation.',
    pricePi: 0.001,
    image: 'https://images.pexels.com/photos/4700400/pexels-photo-4700400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'gweru',
    category: 'Appliances',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  // ── ZIM ESSENTIALS ──
  {
    id: 'prod-23',
    stockQuantity: 50,
    sellerId: 'seller-mutare-essentials',
    name: 'Solar Kit 550W Panel + 3kW Inverter',
    description: 'Complete solar kit: 550W monocrystalline panel, 3kW pure sine wave inverter, and mounting hardware. Power your home off-grid.',
    pricePi: 0.0028,
    image: 'https://images.pexels.com/photos/29206488/pexels-photo-29206488.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'mutare',
    category: 'Zim Essentials',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'prod-24',
    stockQuantity: 60,
    sellerId: 'seller-mutare-essentials',
    name: 'JoJo Tank 5000L Water Tank',
    description: '5000-litre JoJo water tank. UV-resistant, food-grade, made in Zimbabwe. Solve your water storage needs.',
    pricePi: 0.0015,
    image: 'https://images.pexels.com/photos/27566315/pexels-photo-27566315.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Zim Essentials',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'prod-25',
    stockQuantity: 40,
    sellerId: 'seller-mutare-essentials',
    name: '125cc Motorbike — New',
    description: '125cc motorbike, perfect for deliveries or personal transport. Fuel efficient, low mileage, ready to ride.',
    pricePi: 0.003,
    image: 'https://images.pexels.com/photos/9269111/pexels-photo-9269111.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Zim Essentials',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  // ── REAL ESTATE ──
  {
    id: 'prod-401',
    stockQuantity: 1,
    sellerId: 'seller-zim-property',
    name: 'Residential Stand 200sqm — Cowdray Park Bulawayo',
    description: '200sqm residential stand in Cowdray Park, Bulawayo. Title deeds available. Pay 0.05 Pi reservation deposit. Balance via bank transfer. Viewing arranged within 24hrs.',
    pricePi: 0.05,
    image: 'https://images.pexels.com/photos/39197674/pexels-photo-39197674.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'bulawayo',
    category: 'Real Estate',
    isRealEstate: true,
    realEstateBadge: 'Title Deeds Available',
    usdFullPrice: 15000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'prod-402',
    stockQuantity: 1,
    sellerId: 'seller-zim-property',
    name: '2-Bed Cottage Mkoba Gweru — Walled + Borehole',
    description: '2-bedroom cottage in Mkoba, Gweru. Walled yard with borehole. Title deeds in order. Pay 0.12 Pi reservation deposit. Balance via bank transfer.',
    pricePi: 0.12,
    image: 'https://images.pexels.com/photos/30679494/pexels-photo-30679494.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'gweru',
    category: 'Real Estate',
    isRealEstate: true,
    realEstateBadge: 'For Sale',
    usdFullPrice: 38000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'prod-403',
    stockQuantity: 1,
    sellerId: 'seller-harare-property',
    name: 'Shop Space 40sqm Harare CBD — First Street',
    description: '40sqm commercial shop space on First Street, Harare CBD. Prime location. Pi deposit secures the rental. Monthly rent payable in USD.',
    pricePi: 0.08,
    image: 'https://images.pexels.com/photos/2014342/pexels-photo-2014342.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'harare',
    category: 'Real Estate',
    isRealEstate: true,
    realEstateBadge: 'To Rent — Pi Deposit',
    usdFullPrice: 25000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'prod-404',
    stockQuantity: 1,
    sellerId: 'seller-zim-property',
    name: '2 Hectare Plot — Masvingo Great Zimbabwe Road',
    description: '2-hectare agricultural plot along Great Zimbabwe Road, Masvingo. Fertile soil, good road access. Ideal for farming. Title deeds available. Pi reservation deposit.',
    pricePi: 0.15,
    image: 'https://images.pexels.com/photos/9890016/pexels-photo-9890016.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    gcvSupported: true,
    hub: 'masvingo',
    category: 'Real Estate',
    isRealEstate: true,
    realEstateBadge: 'Farm Land',
    usdFullPrice: 47000,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

const SELLERS_KEY = 'ze_sellers';
const PRODUCTS_KEY = 'ze_products';
const SEED_FLAG_KEY = 'ze_seeded_v4';
const GCV_TOGGLE_KEY = 'ze_gcv_only';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function safeGet<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function ensureSeeded(): void {
  if (!isClient()) return;
  if (localStorage.getItem(SEED_FLAG_KEY)) return;
  safeSet(SELLERS_KEY, SEED_SELLERS);
  safeSet(PRODUCTS_KEY, SEED_PRODUCTS);
  localStorage.setItem(SEED_FLAG_KEY, '1');
}

export function getSellers(): Seller[] {
  return safeGet<Seller[]>(SELLERS_KEY, []);
}

export function getSeller(id: string): Seller | undefined {
  return getSellers().find((s) => s.id === id);
}

export function saveSeller(seller: Seller): void {
  const sellers = getSellers();
  const idx = sellers.findIndex((s) => s.id === seller.id);
  if (idx >= 0) {
    sellers[idx] = seller;
  } else {
    sellers.push(seller);
  }
  safeSet(SELLERS_KEY, sellers);
}

export function getProducts(): Product[] {
  return safeGet<Product[]>(PRODUCTS_KEY, []);
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function getProductsBySeller(sellerId: string): Product[] {
  return getProducts().filter((p) => p.sellerId === sellerId);
}

export function saveProduct(product: Product): void {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.unshift(product);
  }
  safeSet(PRODUCTS_KEY, products);
}

export function updateProductStock(productId: string, stock: number): void {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx >= 0) {
    products[idx] = { ...products[idx], stockQuantity: Math.max(0, stock) };
    safeSet(PRODUCTS_KEY, products);
  }
}

export function decreaseProductStock(items: { productId: string; quantity: number }[]): void {
  const products = getProducts();
  let changed = false;
  for (const item of items) {
    const idx = products.findIndex((p) => p.id === item.productId);
    if (idx >= 0 && products[idx].stockQuantity != null) {
      products[idx] = {
        ...products[idx],
        stockQuantity: Math.max(0, products[idx].stockQuantity! - item.quantity),
      };
      changed = true;
    }
  }
  if (changed) safeSet(PRODUCTS_KEY, products);
}

export function getGcvOnly(): boolean {
  if (!isClient()) return false;
  return localStorage.getItem(GCV_TOGGLE_KEY) === '1';
}

export function setGcvOnly(value: boolean): void {
  if (!isClient()) return;
  localStorage.setItem(GCV_TOGGLE_KEY, value ? '1' : '0');
}

export { HUBS };

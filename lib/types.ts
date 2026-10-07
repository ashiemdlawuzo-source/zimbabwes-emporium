export type ShopType = 'big_shop' | 'tuckshop' | 'individual' | 'real_estate';

export interface Seller {
  id: string;
  name: string;
  type: ShopType;
  bio: string;
  avatar: string;
  hub: string;
  phone: string;
  createdAt: number;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  pricePi: number;
  image: string;
  gcvSupported: boolean;
  hub: string;
  category: string;
  createdAt: number;
  isRealEstate?: boolean;
  realEstateBadge?: string;
  usdFullPrice?: number;
  stockQuantity?: number;
}

export interface Hub {
  id: string;
  name: string;
  region: string;
  description: string;
}

export type HubStatus = 'pending' | 'approved';

export type HubType = 'country' | 'local';
export type TransportType = 'truck' | 'bus' | 'bicycle' | 'foot';

export interface RegisteredHub {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  description: string;
  feePi: number;
  status: HubStatus;
  createdAt: number;
  hubType?: HubType;
  province?: string;
  district?: string;
  ward?: string;
  village?: string;
  suburb?: string;
  coverageRadiusKm?: number;
  transportType?: TransportType;
  isCountryWide?: boolean;
  provincesCovered?: string[];
}

export const ZIM_PROVINCES = [
  'Harare',
  'Bulawayo',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Midlands',
  'Matabeleland North',
  'Matabeleland South',
] as const;

export const ZIM_DISTRICTS: Record<string, string[]> = {
  Harare: ['Harare Urban', 'Harare Rural', 'Chitungwiza', 'Epworth', 'Ruwa'],
  Bulawayo: ['Bulawayo Urban', 'Bulawayo Rural'],
  Manicaland: ['Mutare', 'Buhera', 'Chipinge', 'Nyanga', 'Makoni', 'Rusape', 'Chimanimani'],
  'Mashonaland Central': ['Bindura', 'Guruve', 'Mazowe', 'Mount Darwin', 'Rushinga', 'Shamva'],
  'Mashonaland East': ['Marondera', 'Murehwa', 'Mutoko', 'Seke', 'Wedza', 'Chivhu', 'Goromonzi'],
  'Mashonaland West': ['Chinhoyi', 'Kadoma', 'Kariba', 'Kwekwe', 'Mhangura', 'Zvimba', 'Chegutu'],
  Masvingo: ['Masvingo', 'Bikita', 'Chiredzi', 'Gutu', 'Mwenezi', 'Zaka', 'Chivi'],
  Midlands: ['Gweru', 'Kwekwe', 'Mberengwa', 'Shurugwi', 'Zvishavane', 'Gokwe'],
  'Matabeleland North': ['Hwange', 'Binga', 'Lupane', 'Nkayi', 'Tsholotsho', 'Umguza'],
  'Matabeleland South': ['Beitbridge', 'Bulilima', 'Gwanda', 'Mangwe', 'Matobo', 'Insiza'],
};

export const TRANSPORT_LABELS: Record<TransportType, string> = {
  truck: 'Truck',
  bus: 'Bus',
  bicycle: 'Bicycle',
  foot: 'On foot',
};

export const TRANSPORT_ICONS: Record<TransportType, string> = {
  truck: 'Truck',
  bus: 'Bus',
  bicycle: 'Bike',
  foot: 'Footprints',
};

export type DeliveryType = 'direct' | 'hub_escrow';

export type OrderStatus =
  | 'paid'
  | 'at_hub'
  | 'delivered_pending'
  | 'delivered'
  | 'disputed'
  | 'completed';

export interface CartItem {
  productId: string;
  sellerId: string;
  name: string;
  pricePi: number;
  image: string;
  hub: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  sellerId: string;
  sellerName: string;
  name: string;
  pricePi: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  buyerName: string;
  items: OrderItem[];
  totalPi: number;
  productAmount?: number;
  hubFee?: number;
  distanceKm?: number;
  goodsType?: 'small' | 'large';
  deliveryType: DeliveryType;
  hubId: string | null;
  hubName: string | null;
  status: OrderStatus;
  paymentId: string;
  createdAt: number;
  updatedAt: number;
  deliveryCode?: string;
  deliveryPhoto?: string;
  deliveredAt?: number;
  disputedAt?: number;
  disputeReason?: string;
  confirmedAt?: number;
  gps?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: string;
  senderRole: 'buyer' | 'seller' | 'hub';
  message: string;
  createdAt: number;
}

export const SHOP_TYPE_LABELS: Record<ShopType, string> = {
  big_shop: 'Big Shop',
  tuckshop: 'Tuckshop',
  individual: 'Individual Seller',
  real_estate: 'Real Estate',
};

export const SHOP_TYPE_DESCRIPTIONS: Record<ShopType, string> = {
  big_shop: 'Established retail shops like OK Zimbabwe',
  tuckshop: 'Neighborhood corner stores',
  individual: 'Selling directly as an individual — like Amai',
  real_estate: 'Property listings — stands, houses, commercial space',
};

export const SHOP_TYPE_FILTERS: { value: ShopType; label: string }[] = [
  { value: 'big_shop', label: 'Big Shops' },
  { value: 'tuckshop', label: 'Tuckshops' },
  { value: 'individual', label: 'Individuals' },
];

export const CATEGORIES = [
  'Fresh Market',
  'Electronics',
  'Appliances',
  'Zim Essentials',
  'Real Estate',
  'Groceries & Food',
  'Fresh Produce',
  'Fabrics & Clothing',
  'Handicrafts',
  'Hardware & Spares',
  'Health & Beauty',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MARKET_CATEGORIES = [
  'Fresh Market',
  'Electronics',
  'Appliances',
  'Zim Essentials',
  'Real Estate',
] as const;

export const GCV_USD_PER_PI = 314159;

export const HUB_CITIES = [
  'Harare',
  'Bulawayo',
  'Mutare',
  'Gweru',
  'Masvingo',
  'Kwekwe',
  'Kadoma',
  'Chitungwiza',
  'Marondera',
  'Hwange',
] as const;

export const HUBS: Hub[] = [
  {
    id: 'harare',
    name: 'Harare',
    region: 'Mashonaland',
    description: 'Capital city hub — pickup & escrow delivery for the greater Harare area.',
  },
  {
    id: 'bulawayo',
    name: 'Bulawayo',
    region: 'Matabeleland',
    description: 'Bulawayo metro hub serving the southwestern region of Zimbabwe.',
  },
  {
    id: 'mutare',
    name: 'Mutare',
    region: 'Manicaland',
    description: 'Eastern border hub for Mutare and the Manicaland province.',
  },
  {
    id: 'gweru',
    name: 'Gweru',
    region: 'Midlands',
    description: 'Central Zimbabwe hub connecting the Midlands province.',
  },
  {
    id: 'masvingo',
    name: 'Masvingo',
    region: 'Masvingo',
    description: 'Southeastern hub for Masvingo and surrounding districts.',
  },
];

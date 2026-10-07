export type GoodsType = 'small' | 'large';

export interface HubFeeConfig {
  baseFee: number;
  perKmRate: number;
  feeSmallItem: number;
  feeLargeItem: number;
}

export const DEFAULT_HUB_FEE_CONFIG: HubFeeConfig = {
  baseFee: 0.000001,
  perKmRate: 0.00000005,
  feeSmallItem: 0.000001,
  feeLargeItem: 0.000003,
};

export const GOODS_TYPE_LABELS: Record<GoodsType, string> = {
  small: 'Small Parcel',
  large: 'Large Item',
};

type CityPair = string;

const CITY_DISTANCES: Record<CityPair, number> = {};

function setDistance(a: string, b: string, km: number) {
  const key1 = `${a}-${b}`;
  const key2 = `${b}-${a}`;
  CITY_DISTANCES[key1] = km;
  CITY_DISTANCES[key2] = km;
}

setDistance('Harare', 'Bulawayo', 430);
setDistance('Harare', 'Mutare', 265);
setDistance('Harare', 'Gweru', 275);
setDistance('Harare', 'Masvingo', 292);
setDistance('Harare', 'Kwekwe', 230);
setDistance('Harare', 'Kadoma', 210);
setDistance('Harare', 'Chitungwiza', 15);
setDistance('Harare', 'Marondera', 72);
setDistance('Harare', 'Hwange', 540);
setDistance('Bulawayo', 'Gweru', 165);
setDistance('Bulawayo', 'Mutare', 580);
setDistance('Bulawayo', 'Masvingo', 282);
setDistance('Bulawayo', 'Kwekwe', 335);
setDistance('Bulawayo', 'Kadoma', 350);
setDistance('Bulawayo', 'Hwange', 180);
setDistance('Bulawayo', 'Marondera', 440);
setDistance('Mutare', 'Gweru', 290);
setDistance('Mutare', 'Masvingo', 290);
setDistance('Mutare', 'Kwekwe', 320);
setDistance('Gweru', 'Masvingo', 190);
setDistance('Gweru', 'Kwekwe', 75);
setDistance('Gweru', 'Kadoma', 155);
setDistance('Masvingo', 'Kwekwe', 240);

const SAME_CITY_KM = 15;

export function getCityDistance(cityA: string, cityB: string): number {
  if (!cityA || !cityB) return SAME_CITY_KM;
  const a = cityA.charAt(0).toUpperCase() + cityA.slice(1).toLowerCase();
  const b = cityB.charAt(0).toUpperCase() + cityB.slice(1).toLowerCase();
  if (a === b) return SAME_CITY_KM;
  const key = `${a}-${b}`;
  return CITY_DISTANCES[key] ?? 300;
}

export interface HubFeeResult {
  fee: number;
  distance: number;
  breakdown: {
    base: number;
    distanceCost: number;
    goodsCost: number;
  };
}

export function calculateHubFee(
  sellerCity: string,
  hubCity: string,
  goodsType: GoodsType,
  config: HubFeeConfig = DEFAULT_HUB_FEE_CONFIG
): HubFeeResult {
  const distance = getCityDistance(sellerCity, hubCity);
  const distanceCost = distance * config.perKmRate;
  const goodsCost = goodsType === 'large' ? config.feeLargeItem : config.feeSmallItem;
  const fee = config.baseFee + distanceCost + goodsCost;
  return {
    fee,
    distance,
    breakdown: {
      base: config.baseFee,
      distanceCost,
      goodsCost,
    },
  };
}

export function inferGoodsType(category: string): GoodsType {
  const largeCategories = ['Appliances', 'Electronics', 'Hardware & Spares', 'Real Estate'];
  return largeCategories.includes(category) ? 'large' : 'small';
}

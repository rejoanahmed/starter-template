export type Amenity = {
  key: string;
  label: string;
  icon: string;
};

export const BASIC: Amenity[] = [
  { key: "wifi", label: "Wi-Fi", icon: "wifi" },
  { key: "aircon", label: "Air-con", icon: "air-conditioner" },
  { key: "toilet", label: "Toilet", icon: "toilet" },
  { key: "sofa", label: "Sofa", icon: "sofa" },
  { key: "fridge", label: "Refrigerator", icon: "fridge-outline" },
  { key: "drinks", label: "Drinks", icon: "cup" },
];

export const ENTERTAINMENT: Amenity[] = [
  { key: "mahjong", label: "Mahjong Table", icon: "grid" },
  { key: "poker", label: "Poker", icon: "cards" },
  { key: "dice", label: "Dice", icon: "dice-multiple-outline" },
  { key: "chips", label: "Chips", icon: "chip" },
  { key: "board", label: "Board Game", icon: "puzzle" },
  { key: "ps", label: "PS4/ PS5", icon: "sony-playstation" },
  { key: "switch", label: "Switch", icon: "nintendo-switch" },
];

export const AV: Amenity[] = [
  { key: "tv", label: "Television", icon: "television-classic" },
  { key: "speaker", label: "Speaker", icon: "speaker" },
  { key: "mic", label: "Microphone", icon: "microphone-outline" },
];

export const AMENITIES_CATEGORIES = {
  BASIC,
  ENTERTAINMENT,
  AV,
} as const;

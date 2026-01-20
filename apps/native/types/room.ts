// Room type definitions
export type SFSymbols6_0 =
  | "house.fill"
  | "paperplane.fill"
  | "chevron.left"
  | "chevron.right"
  | "wifi"
  | "tv"
  | "airconditioning"
  | "toilet"
  | "table.furniture"
  | "gamecontroller";

export type Facility = {
  name: string;
  icon: SFSymbols6_0;
};

export type Review = {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
};

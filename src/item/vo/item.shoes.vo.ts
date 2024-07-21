import { Equipment } from "./item.equipment.vo";

export type Shoes = Equipment & {
  def: number;
  spd: number;
};

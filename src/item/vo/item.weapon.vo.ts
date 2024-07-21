import { Equipment } from "./item.equipment.vo";

export type Weapon = Equipment & {
  atk: number;
  def: number;
  spd: number;
};

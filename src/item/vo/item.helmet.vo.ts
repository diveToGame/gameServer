import { Equipment } from "./item.equipment.vo";

export type Helmet = Equipment & {
  hp: number;
  def: number;
};

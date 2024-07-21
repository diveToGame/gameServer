import { Equipment } from "./item.equipment.vo";

export type Accessary = Equipment & {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}
import { Accessary } from "./accessary";
import { Helmet } from "./helmet";
import { Shoes } from "./shoes";
import { Weapon } from "./weapon";

export class UserCharactor {
  nickname: string;

  hp: number;
  atk: number;
  def: number;
  spd: number;

  equipment: {
    helmet: Helmet;
    weapon: Weapon;
    shoes: Shoes;
    accessary: Accessary;
  }
  items: {
    helmet: Helmet[];
    weapon: Weapon[];
    shoes: Shoes[];
    accessary: Accessary[];
  }
}
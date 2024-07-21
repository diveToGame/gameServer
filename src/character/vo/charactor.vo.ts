import { Accessary } from "src/item/vo/item.accessary.vo";
import { Helmet } from "src/item/vo/item.helmet.vo";
import { Shoes } from "src/item/vo/item.shoes.vo";
import { Weapon } from "src/item/vo/item.weapon.vo";

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
  };
  items: {
    helmet: Helmet[];
    weapon: Weapon[];
    shoes: Shoes[];
    accessary: Accessary[];
  };
}

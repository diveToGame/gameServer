import { UserCharactor } from "src/user/user.charactor";

export type RoomDTO = {
  id: number;
  name: string;
  seated: number;
  seats: number;

  isPublic: boolean;
  isPvP: boolean;
}
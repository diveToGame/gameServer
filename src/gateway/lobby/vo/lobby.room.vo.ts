export class RoomVO {
  readonly name: string;
  users: Set<WebSocket>;
  seated: number;
  readonly seats: number;

  readonly isPublic: boolean;
  readonly isPvP: boolean;

  constructor(name: string, seats: number, isPublic: boolean, isPvP: boolean) {
    this.name = name;
    this.seats = seats;
    this.isPublic = isPublic;
    this.isPvP = isPvP;
  }
}

import { Column, Entity } from "typeorm";

@Entity()
export class UserEntity {
  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;
}
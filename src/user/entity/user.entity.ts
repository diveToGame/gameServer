import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('user')
export class UserEntity {
  @PrimaryColumn('varchar', { length: 255 })
  email: string;

  @Column('varchar', { length: 255 })
  username: string;

  @Column('varchar', { length: 255 })
  password: string;
}
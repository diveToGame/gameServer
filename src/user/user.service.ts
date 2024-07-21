import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { UserVO } from "./vo/user.vo";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepositoy: Repository<UserEntity>
  ) {}

  async findOne(email: string): Promise<UserVO> {
    const userEntity = await this.userRepositoy.findOne({
      where: { email: email },
    });
    return { ...userEntity };
  }
}

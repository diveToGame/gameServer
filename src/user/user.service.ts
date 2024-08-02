import { ConflictException, Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { UserVO } from "./vo/user.vo";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  async findOne(email: string): Promise<UserVO> {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  async insert(user: UserVO): Promise<string> {
    try {
      await this.userRepository.insert(user);

      return user.email;
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new ConflictException("User with this email already exists");
      } else if (error.code === "ER_NO_DEFAULT_FOR_FIELD") {
        throw new UnprocessableEntityException("Missing fields");
      }
      this.logger.error(error.message);
    }
  }
}

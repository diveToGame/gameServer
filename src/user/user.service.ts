import { ConflictException, Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { UserVO } from "./vo/user.vo";
import { Observable, from, map, catchError, of } from "rxjs";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  findOne(email: string): Observable<UserVO> {
    return from(this.userRepository.findOne({ where: { email: email } })).pipe(
      map((userEntity) => ({ ...userEntity }))
    );
  }

  insert(user: UserVO): string {
    try {
      from(this.userRepository.insert(user)).pipe(catchError((err) => of([err])));

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

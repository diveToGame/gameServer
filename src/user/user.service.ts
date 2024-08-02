import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "./entity/user.entity";
import { UserVO } from "./vo/user.vo";
import { Observable, from, map } from "rxjs";

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

  insert(user: UserVO): Observable<string> {
    return from(this.userRepository.insert(user)).pipe(
      map(() => user.email)
      // catchError((error) => {
      //   if (error.code === "ER_DUP_ENTRY") {
      //     return throwError(() => new ConflictException("User with this email already exists"));
      //   } else if (error.code === "ER_NO_DEFAULT_FOR_FIELD") {
      //     return throwError(() => new UnprocessableEntityException("Missing fields"));
      //   }
      //   this.logger.error(error.message);
      //   return throwError(() => error);
      // })
    );
  }
}

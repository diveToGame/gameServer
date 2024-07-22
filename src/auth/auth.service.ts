import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { SignInDTO } from "./dto/auth.sign-in.dto";
import { SignInRTO } from "./rto/auth.sign-in.rto";
import { SignUpDTO } from "./dto/auth.sign-up.dto";
import { SignUpRTO } from "./rto/auth.sign-up.rto";

import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async getUsername(email: string): Promise<string> {
    const { username } = await this.userService.findOne(email);

    return username;
  }

  async signIn({ email, password }: SignInDTO): Promise<SignInRTO> {
    const { username, password: hashPassword } = await this.userService.findOne(email);

    if (bcrypt.compare(password, hashPassword)) {
      return {
        email,
        username,
        ticket: "foo",
      };
    }
    throw new HttpException("UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
  }

  async signUp(signUpDTO: SignUpDTO): Promise<SignUpRTO> {
    const salt = bcrypt.genSaltSync();
    const hashPassword = await bcrypt.hash(signUpDTO.password, salt);

    const userVO = { ...signUpDTO };
    userVO.password = hashPassword;
    return { email: await this.userService.insert(userVO) };
  }
}

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { SignInInboundDTO } from "./dto/inbound/auth.sign-in.dto.inbound";
import { SignInOutboundDTO } from "./dto/outbound/auth.sign-in.dto.outbound";
import { SignUpInboundDTO } from "./dto/inbound/auth.sign-up.dto.inbound";
import { signUpOutboundDTO } from "./dto/outbound/auth.sign-up.dto.outbound";

import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async getUsername(email: string): Promise<string> {
    const { username } = await this.userService.findOne(email);

    return username;
  }

  async signIn({ email, password }: SignInInboundDTO): Promise<SignInOutboundDTO> {
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

  async signUp(signUpDTO: SignUpInboundDTO): Promise<signUpOutboundDTO> {
    const salt = bcrypt.genSaltSync();
    const hashPassword = await bcrypt.hash(signUpDTO.password, salt);

    const userVO = { ...signUpDTO };
    userVO.password = hashPassword;
    return { email: await this.userService.insert(userVO) };
  }
}

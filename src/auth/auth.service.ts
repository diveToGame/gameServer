import * as bcrypt from "bcryptjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { SignInRequestDTO } from "./dto/request/auth.sign-in.request.dto";
import { SignUpRequestDTO } from "./dto/request/auth.sign-up.request.dto";
import { SignInResponseDTO } from "./dto/response/auth.sign-in.response.dto";
import { ConfigService } from "@nestjs/config";
import { UserVO } from "src/user/vo/user.vo";
import { JwtService } from "@nestjs/jwt";
import { Payload } from "./vo/auth.payload.vo";
import { IsoMap } from "src/common/IsoMap";

@Injectable()
export class AuthService {
  private accountMap = new IsoMap<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  async getUsername(email: string): Promise<string> {
    return (await this.userService.findOne(email)).username;
  }

  async signIn({ email, password }: SignInRequestDTO): Promise<SignInResponseDTO> {
    const user = await this.userService.findOne(email);

    if (this.accountMap.has(email)) {
      // TODO : invalid 처리(이미 로그인 중임)
    }
    if (await bcrypt.compare(password, user?.password)) {
      throw new UnauthorizedException();
    }
    return {
      email: email,
      username: user.username,
      accessToken: await this.generateAccessToken(user),
      refreshToken: await this.generateRefreshToken(user),
    };
  }

  signOut(token: string) {
    this.accountMap.pop(token);
  }

  async signUp(signUpDTO: SignUpRequestDTO) {
    return this.userService.insert({
      ...signUpDTO,
      password: await bcrypt.hash(signUpDTO.password, bcrypt.genSaltSync()),
    });
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // TODO validate 하는 거 마무리 하고, refresh 하는거도 할 것
      await this.jwtService.verifyAsync(token, {
        secret: this.configService.get("JWT_SECRET"),
      });
      return this.accountMap.has(token);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async generateAccessToken(user: UserVO): Promise<string> {
    const payload: Payload = {
      email: user.email,
      username: user.username,
    };

    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  async generateRefreshToken(user: UserVO): Promise<string> {
    const { email, username }: Payload = {
      ...user,
    };
    return this.jwtService.signAsync(
      { email, username },
      {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get("JWT_REFRESH_EXPIRE_TIME"),
      }
    );
  }
}

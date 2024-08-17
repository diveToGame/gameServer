import * as bcrypt from "bcryptjs";
import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { SignInRequestDTO } from "./dto/request/auth.sign-in.request.dto";
import { SignUpRequestDTO } from "./dto/request/auth.sign-up.request.dto";
import { SignInResponseDTO } from "./dto/response/auth.sign-in.response.dto";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Payload } from "./vo/auth.payload.vo";
import { IsoMap } from "./../common/IsoMap";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
  private accountMap = new IsoMap<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  async getUsername(email: string): Promise<string> {
    const username = (await this.userService.findOne(email))?.username;

    if (username === undefined) throw new NotFoundException("email not found");
    return username;
  }

  async signIn({ email, password }: SignInRequestDTO): Promise<SignInResponseDTO> {
    const { username, password: encryptedPassword } = await this.userService.findOne(email);

    if (this.accountMap.has(email)) {
      throw new UnauthorizedException();
    }
    if ((await bcrypt.compare(password, encryptedPassword)) === false) {
      throw new UnauthorizedException();
    }
    const { access, refresh } = await this.generateTokens({ email, username });

    this.accountMap.set(email, access);
    return {
      email: email,
      username: username,
      accessToken: access,
      refreshToken: refresh,
    };
  }

  signOut(token: string): string {
    const res = this.accountMap.pop(token)?.key;
    if (res === undefined)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: "token not found",
        },
        HttpStatus.NOT_FOUND
      );
    return res;
  }

  async signUp(signUpDTO: SignUpRequestDTO): Promise<string> {
    if (signUpDTO.email === undefined || signUpDTO.username === undefined || signUpDTO.password === undefined) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: "email or password not found",
        },
        HttpStatus.NOT_FOUND
      );
    }
    return this.userService.insert({
      ...signUpDTO,
      password: await bcrypt.hash(signUpDTO.password, bcrypt.genSaltSync()),
    });
  }

  async validateToken(token: string): Promise<boolean> {
    await this.validateTokenHelper(token, this.configService.get("JWT_SECRET"));

    return this.accountMap.has(token);
  }

  async regenerateTokens(refreshToken: string): Promise<SignInResponseDTO> {
    const { email, username }: Payload = await this.validateTokenHelper(
      refreshToken,
      this.configService.get("JWT_REFRESH_SECRET")
    );

    if (!this.accountMap.has(email)) throw new UnauthorizedException();

    const { access, refresh } = await this.generateTokens({ email, username });
    this.accountMap.set(email, access);

    return {
      email,
      username,
      accessToken: access,
      refreshToken: refresh,
    };
  }

  private async validateTokenHelper(token: string, secret: string): Promise<Payload> {
    try {
      const payload: Payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async generateTokens({ email, username }: { email: string; username: string }) {
    const access = await this.jwtService.signAsync(
      { email, username },
      { secret: this.configService.get("JWT_SECRET"), expiresIn: this.configService.get("JWT_EXPIRE_MINUTES") }
    );

    const refresh = await this.jwtService.signAsync(
      { email, username },
      {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get("JWT_REFRESH_EXPIRE_DAYS"),
      }
    );
    return { access, refresh };
  }
}

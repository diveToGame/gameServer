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
import { RegenerateTokenResponseDTO } from "./dto/response/auth.regenerate-token.response.dto";
import { SignUpResponseDTO } from "./dto/response/auth.sign-up.response.dto";

@Injectable()
export class AuthService {
  private readonly MINUTES_TO_MILLISECONDS = 60 * 1000;

  private accountMap = new IsoMap<string, string>();
  private pingTimerMap = new Map<string, NodeJS.Timeout>();

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
    const { access, refresh } = this.generateTokens({ email, username });

    this.updateAccount({ email, accessToken: access });

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

  async signUp(signUpDTO: SignUpRequestDTO): Promise<SignUpResponseDTO> {
    if (signUpDTO.email === undefined || signUpDTO.username === undefined || signUpDTO.password === undefined) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: "email or password not found",
        },
        HttpStatus.NOT_FOUND
      );
    }
    return {
      email: await this.userService.insert({
        ...signUpDTO,
        password: await bcrypt.hash(signUpDTO.password, bcrypt.genSaltSync()),
      }),
    };
  }

  validateToken(token: string): boolean {
    this.validateTokenHelper(token, this.configService.get("JWT_SECRET"));

    return this.accountMap.has(token);
  }

  regenerateTokens(refreshToken: string): RegenerateTokenResponseDTO {
    const { email, username }: Payload = this.validateTokenHelper(
      refreshToken,
      this.configService.get("JWT_REFRESH_SECRET")
    );

    if (!this.accountMap.has(email)) throw new UnauthorizedException();

    const { access, refresh } = this.generateTokens({ email, username });

    this.updateAccount({ email, accessToken: access });

    return {
      accessToken: access,
      refreshToken: refresh,
    };
  }

  ping(token: string): string {
    const email = this.accountMap.get(token);
    this.updateAccount({ email, accessToken: token });

    return token;
  }

  private updateAccount({ email, accessToken }: { email: string; accessToken: string }) {
    const deprecatedAccess = this.accountMap.get(email);

    if (deprecatedAccess) {
      clearTimeout(this.pingTimerMap.get(deprecatedAccess));
      this.pingTimerMap.delete(deprecatedAccess);
    }

    const timer = setTimeout(
      () => {
        this.accountMap.pop(email);
        this.pingTimerMap.delete(accessToken);
      },
      this.configService.get("JWT_EXPIRE_MINUTES") * this.MINUTES_TO_MILLISECONDS
    );
    this.pingTimerMap.set(accessToken, timer);
    this.accountMap.set(email, accessToken);
  }

  private validateTokenHelper(token: string, secret: string): Payload {
    try {
      const payload: Payload = this.jwtService.verify(token, {
        secret,
      });
      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private generateTokens({ email, username }: { email: string; username: string }) {
    const access = this.jwtService.sign(
      { email, username },
      { secret: this.configService.get("JWT_SECRET"), expiresIn: this.configService.get("JWT_EXPIRE_MINUTES") }
    );

    const refresh = this.jwtService.sign(
      { email, username },
      {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get("JWT_REFRESH_EXPIRE_DAYS"),
      }
    );
    return { access, refresh };
  }
}

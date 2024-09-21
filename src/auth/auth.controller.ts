import { Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { MessageBody } from "@nestjs/websockets";
import { AuthService } from "./auth.service";
import { SignInRequestDTO } from "./dto/request/auth.sign-in.request.dto";
import { SignUpRequestDTO } from "./dto/request/auth.sign-up.request.dto";
import { SignOutRequestDTO } from "./dto/request/auth.sign-out.request.dto";
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SignInResponseDTO } from "./dto/response/auth.sign-in.response.dto";
import { SignUpResponseDTO } from "./dto/response/auth.sign-up.response.dto";
import { AuthHeaderGuard } from "./guard/auth.header.guard";
import { RegenerateTokenRequestDTO } from "./dto/request/auth.regenerate-token.request.dto";
import { RegenerateTokenResponseDTO } from "./dto/response/auth.regenerate-token.response.dto";

@ApiTags("AUTH")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "Get User email",
  })
  @ApiResponse({
    status: 200,
    description: "SUCCEEDED",
    type: String,
  })
  @ApiQuery({
    name: "username",
    description: "require email to get corresponding username",
    required: true,
    type: String,
    example: "inwoo@gmail.com",
  })
  @UseGuards(AuthHeaderGuard)
  @Get("username")
  getUsername(@Query("email") email: string) {
    return this.authService.getUsername(email);
  }

  @ApiOperation({
    summary: "Sign in",
  })
  @ApiResponse({
    status: 200,
    description: "SUCCEEDED",
    type: SignInResponseDTO,
  })
  @Post("sign-in")
  async signIn(@MessageBody() { email, password }: SignInRequestDTO): Promise<SignInResponseDTO> {
    return this.authService.signIn({ email, password });
  }

  @ApiOperation({
    summary: "Sign out",
  })
  @UseGuards(AuthHeaderGuard)
  @Get("sign-out")
  signOut(@Req() request: Request) {
    const authHeader = request.headers["authorization"];

    return this.authService.signOut(authHeader.split(" ")[1]);
  }

  @ApiOperation({
    summary: "Sign up",
  })
  @ApiResponse({
    status: 200,
    description: "SUCCEEDED",
    type: SignUpResponseDTO,
  })
  @Post("sign-up")
  async signUp(@MessageBody() { email, username, password }: SignUpRequestDTO): Promise<SignUpResponseDTO> {
    return this.authService.signUp({ email, username, password });
  }

  // TODO refresh token 가지고 재발급하는 API 만들 것
  @Post("regenerate-token")
  regenerateToken(@MessageBody() { refreshToken }: RegenerateTokenRequestDTO): RegenerateTokenResponseDTO {
    return this.authService.regenerateTokens(refreshToken);
  }

  @UseGuards(AuthHeaderGuard)
  @Get("ping")
  ping(@Req() request: Request) {
    const authHeader = request.headers["authorization"];

    return this.authService.ping(authHeader.split(" ")[1]);
  }
}

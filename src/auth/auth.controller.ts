import { Controller, Get, Post, Query } from "@nestjs/common";
import { MessageBody } from "@nestjs/websockets";
import { AuthService } from "./auth.service";
import { SignInRequestDTO } from "./dto/request/auth.sign-in.request.dto";
import { SignUpRequestDTO } from "./dto/request/auth.sign-up.request.dto";
import { SignOutRequestDTO } from "./dto/request/auth.sign-out.request.dto";
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SignInResponseDTO } from "./dto/response/auth.sign-in.response.dto";
import { SignUpResponseDTO } from "./dto/response/auth.sign-up.response.dto";

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
  @Post("sign-out")
  signOut(@MessageBody() { token }: SignOutRequestDTO) {
    return this.authService.signOut(token);
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
  signUp(@MessageBody() { email, username, password }: SignUpRequestDTO) {
    return this.authService.signUp({ email, username, password });
  }
}

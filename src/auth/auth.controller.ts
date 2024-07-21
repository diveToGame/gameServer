import { Controller, Get, Post, Query } from "@nestjs/common";
import { MessageBody } from "@nestjs/websockets";
import { AuthService } from "./auth.service";
import { SignInInboundDTO } from "./dto/inbound/auth.sign-in.dto.inbound";
import { SignUpInboundDTO } from "./dto/inbound/auth.sign-up.dto.inbound";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("username")
  getUsername(@Query("email") email: string) {
    return this.authService.getUsername(email);
  }

  @Post("sign-in")
  signIn(@MessageBody() { email, password }: SignInInboundDTO) {
    return this.authService.signIn({ email, password });
  }

  @Post("sign-up")
  signUp(@MessageBody() { email, username, password }: SignUpInboundDTO) {
    return this.authService.signUp({ email, username, password });
  }
}

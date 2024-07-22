import { Controller, Get, Post, Query } from "@nestjs/common";
import { MessageBody } from "@nestjs/websockets";
import { AuthService } from "./auth.service";
import { SignInDTO } from "./dto/auth.sign-in.dto";
import { SignUpDTO } from "./dto/auth.sign-up.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("username")
  getUsername(@Query("email") email: string) {
    return this.authService.getUsername(email);
  }

  @Post("sign-in")
  signIn(@MessageBody() { email, password }: SignInDTO) {
    return this.authService.signIn({ email, password });
  }

  @Post("sign-up")
  signUp(@MessageBody() { email, username, password }: SignUpDTO) {
    return this.authService.signUp({ email, username, password });
  }
}

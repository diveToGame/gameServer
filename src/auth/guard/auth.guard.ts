import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    // const data = context.switchToWs().getData<{ accessToken: string }>();

    // TODO: NEED TO BE TESTED
    const headers = client.upgradeReq?.headers || client.handshake?.headers;
    const authHeader = headers["authorization"];
    if (!authHeader) {
      return null;
    }

    const token = authHeader.split(" ")[1];

    try {
      return this.authService.validateToken(token);
    } catch (err) {
      client.send(JSON.stringify({ event: "error", data: { message: "Unauthorized" } }));
      throw new UnauthorizedException("Invalid token");
    }
  }
}

import { SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";

@WebSocketGateway()
export class IngameGateway {
  @SubscribeMessage("message")
  handleMessage(): string {
    return "Hello world!";
  }
}

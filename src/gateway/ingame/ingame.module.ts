import { Module } from "@nestjs/common";
import { IngameGateway } from "./ingame.gateway";

@Module({
  providers: [IngameGateway],
})
export class IngameModule {}

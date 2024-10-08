import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LobbyModule } from "./gateway/lobby/lobby.module";
import { IngameModule } from "./gateway/ingame/ingame.module";
import { UserEntity } from "./user/entity/user.entity";
import { CharacterModule } from "./character/character.module";
import { AuthModule } from "./auth/auth.module";
import { RoomModule } from "./gateway/room/room.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env.development.local"],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      entities: [UserEntity],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([UserEntity]),
    LobbyModule,
    IngameModule,
    CharacterModule,
    AuthModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [ConfigService, AppService],
})
export class AppModule {}

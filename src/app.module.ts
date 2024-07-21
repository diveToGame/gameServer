import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoomGateway, LobbyGateway } from './events.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { EventsModule } from './events/events.module';
import { LoginGateway } from './gateway/login/login.gateway';
import { LobbyGateway } from './gateway/lobby/lobby.gateway';
import { IngameGateway } from './gateway/ingame/ingame.gateway';
import { LoginModule } from './gateway/login/login.module';
import { LobbyModule } from './gateway/lobby/lobby.module';
import { IngameModule } from './gateway/ingame/ingame.module';
import { CharactersModule } from './character/characters.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    EventsModule,
    LoginModule,
    LobbyModule,
    IngameModule,
    CharactersModule,
  ],
  controllers: [AppController],
  providers: [RoomGateway, LobbyGateway, ConfigService, AppService, LoginGateway, IngameGateway],
})
export class AppModule {}

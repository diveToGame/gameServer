import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "src/user/user.module";
import { TaskSchedulerService } from "src/common/common.task-scheduler.service";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [UserModule, TaskSchedulerService, ConfigService],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

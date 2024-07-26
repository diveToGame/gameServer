import { Module } from "@nestjs/common";
import { TaskSchedulerService } from "./common.task-scheduler.service";

@Module({
  providers: [TaskSchedulerService],
  exports: [TaskSchedulerService],
})
export class CommonModule {}

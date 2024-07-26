import { Injectable } from "@nestjs/common";

@Injectable()
export class TaskSchedulerService {
  private tasks: Map<string, NodeJS.Timeout> = new Map();

  scheduleTask(taskId: string, callback: () => void, delay: number): void {
    if (this.tasks.has(taskId)) {
      throw new Error("Task with ID ${taskId} is already scheduled");
    }

    const timeout = setTimeout(() => {
      callback();
      this.tasks.delete(taskId);
    }, delay);

    this.tasks.set(taskId, timeout);
  }

  cancelTask(taskId: string): void {
    const timeout = this.tasks.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.tasks.delete(taskId);
    } else {
      throw new Error("Task with ID ${taskId} not found");
    }
  }
}

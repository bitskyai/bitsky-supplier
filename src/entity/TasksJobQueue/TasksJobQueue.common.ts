import { Entity } from "typeorm";
import { BaseTasksJobQueue } from './BaseTasksJobQueue';

@Entity('tasks_job_queue')
export class TasksJobQueue extends BaseTasksJobQueue {
}

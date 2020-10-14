import { Entity } from 'typeorm';
import { BaseTask } from '../Task/BaseTask';

@Entity('task_history')
export class TaskHistory extends BaseTask{
}
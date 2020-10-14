import { Entity } from 'typeorm';
import { BaseTask } from './BaseTask';

@Entity('task')
export class Task extends BaseTask{
}
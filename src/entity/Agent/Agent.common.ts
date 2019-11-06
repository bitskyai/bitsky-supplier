import { Entity } from 'typeorm';
import { BaseAgent } from './BaseAgent';

@Entity('agent')
export class Agent extends BaseAgent{
}
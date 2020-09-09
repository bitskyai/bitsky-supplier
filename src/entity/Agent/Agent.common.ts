import { Entity } from 'typeorm';
import { BaseAgent } from './BaseAgent';

@Entity('producer')
export class Agent extends BaseAgent{
}
import { Entity } from 'typeorm';
import { BaseProducer } from './BaseProducer';

@Entity('producer')
export class Producer extends BaseProducer{
}
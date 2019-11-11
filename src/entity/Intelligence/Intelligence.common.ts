import { Entity } from 'typeorm';
import { BaseIntelligence } from './BaseIntelligence';

@Entity('intelligence')
export class Intelligence extends BaseIntelligence{
}
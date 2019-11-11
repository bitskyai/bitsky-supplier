import { Entity } from 'typeorm';
import { BaseIntelligence } from '../Intelligence/BaseIntelligence';

@Entity('intelligence_history')
export class IntelligenceHistory extends BaseIntelligence{
}
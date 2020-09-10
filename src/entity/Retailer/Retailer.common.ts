import { Entity } from 'typeorm';
import { BaseRetailer } from './BaseRetailer';

@Entity('retailer')
export class Retailer extends BaseRetailer{
}
import { Entity } from 'typeorm';
import { BaseServerInformation } from './BaseServerInformation';

@Entity('server_information')
export class ServerInformation extends BaseServerInformation{
}
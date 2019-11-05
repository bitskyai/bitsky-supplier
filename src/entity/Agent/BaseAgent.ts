import { Column } from "typeorm";
import { isMongo } from "../../util/dbConfiguration";
import { BaseMongo, BaseSQL } from "../Base";
let Base: any;
if (isMongo()) {
  Base = BaseMongo;
} else {
  Base = BaseSQL;
}

// This reference to 'schemas/agent.json'
// Will use JSON schema to validation
export abstract class BaseAgent extends Base {

  // ["BROWSEREXTENSION", "SERVICE", "HEADLESSBROWSER"]
  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  description: string;

  // ["PRIVATE", "PUBLIC"]
  @Column({
    default: 'PRIVATE'
  })
  permission: string;

  @Column({
    default: 1
  })
  concurrent: number

  @Column({
    name: 'polling_interval',
    default: 30
  })
  pollingInterval: number

  @Column({
    name: 'max_waiting_time',
    default: 5
  })
  maxWaitingTime: number

  @Column({
    name: 'max_collect'
  })
  maxCollect: number

  @Column({
    name: 'idel_time'
  })
  idelTime: number

  @Column({
    default: 90
  })
  timeout: number;

  @Column({
    name: 'max_retry'
  })
  maxRetry: number;

  @Column({
    name: 'base_url',
    nullable: true
  })
  baseURL: string;

  @Column({
    name: 'health_method',
    nullable: true
  })
  healthMethod: string

  @Column({
    name: 'healthPath',
    nullable: true
  })
  healthPath: string

  @Column({
    name: 'system_state'
  })
  systemState: string

  @Column({
    name: 'system_version'
  })
  systemVersion: string

  @Column({
    name: 'system_security_key',
    nullable: true
  })
  systemSecurityKey: string

  @Column({
    name: 'system_created_at',
    nullable: true
  })
  systemCreatedAt: 'timestamp'

  @Column({
    name: 'system_modified_at',
    nullable: true
  })
  systemModifiedAt: 'timestamp'

  @Column({
    name: 'system_last_ping',
    nullable: true
  })
  systemLastPing: 'timestamp'
}

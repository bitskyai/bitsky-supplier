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

  @Column({
    default: true
  })
  private: boolean

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
    default: 30
  })
  polling_interval: number

  @Column({
    default: 5
  })
  max_waiting_time: number

  @Column()
  max_collect: number

  @Column()
  idel_time: number

  @Column({
    default: 90
  })
  timeout: number;

  @Column()
  max_retry: number;

  @Column({
    nullable: true
  })
  base_url: string;

  @Column({
    nullable: true
  })
  health_method: string

  @Column({
    nullable: true
  })
  health_path: string

  @Column()
  system_state: string

  @Column()
  system_version: string

  @Column({
    nullable: true
  })
  system_security_key: string

  @Column({
    nullable: true
  })
  system_created_at: 'timestamp'

  @Column({
    nullable: true
  })
  system_modified_at: 'timestamp'

  @Column({
    nullable: true
  })
  system_last_ping: 'timestamp'
}

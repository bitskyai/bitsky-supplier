import { Column } from "typeorm";
import { isMongo } from "../../util/dbConfiguration";
import { BaseMongo, BaseSQL } from "../Base";
let Base: any;
if (isMongo()) {
  Base = BaseMongo;
} else {
  Base = BaseSQL;
}

// This reference to 'schemas/retailer.json'
// Will use JSON schema to validation
export abstract class BaseSOI extends Base {
  @Column()
  name: string;

  // @Column({
  //   nullable: true
  // })
  // description: string;

  @Column()
  base_url: string;

  @Column()
  callback_method: string;

  @Column()
  callback_path: string;

  @Column()
  health_method: string;

  @Column()
  health_path: string;

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

  @Column({
    nullable: true
  })
  system_ping_fail_reason: string
}

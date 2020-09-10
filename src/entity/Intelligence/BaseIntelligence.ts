import { Column } from "typeorm";
import { isMongo } from "../../util/dbConfiguration";
import { BaseMongo, BaseSQL } from "../Base";
let Base: any;
if (isMongo()) {
  Base = BaseMongo;
} else {
  Base = BaseSQL;
}

// This reference to 'schemas/task.json'
// Will use JSON schema to validation
export abstract class BaseIntelligence extends Base {
  @Column({
    nullable: true
  })
  type: string;

  @Column({
    nullable: true
  })
  name: string;

  @Column({
    nullable: true
  })
  desciption: string;

  @Column()
  retailer_global_id: string;

  @Column({
    nullable: true
  })
  retailer_state: string;

  @Column({
    nullable: true
  })
  permission: string;

  @Column({
    nullable: true
  })
  priority: number;

  @Column("simple-array")
  suitable_producers: string[];

  @Column()
  url: string;

  @Column({
    type: "simple-json",
    nullable: true
  })
  metadata: string;

  @Column({
    type:"simple-json",
    nullable: true
  })
  dataset: string;

  @Column({
    nullable: true
  })
  system_state: string;

  @Column({
    nullable: true
  })
  system_security_key: string;

  @Column({
    nullable: true
  })
  system_created_at: number;

  @Column({
    nullable: true
  })
  system_modified_at: number;

  @Column({
    nullable: true
  })
  system_started_at: number;

  @Column({
    nullable: true
  })
  system_ended_at: number;

  @Column({
    nullable: true
  })
  system_producer_global_id: string;

  @Column({
    nullable: true
  })
  system_producer_type: string;

  @Column({
    nullable: true
  })
  system_producer_retry_times: number;

  @Column({
    nullable: true
  })
  system_producer_started_at: number;

  @Column({
    nullable: true
  })
  system_producer_ended_at: number;

  @Column({
    nullable: true
  })
  system_version: string;

  @Column({
    nullable: true
  })
  system_failures_number: number;

  @Column({
    nullable: true
  })
  system_failures_reason: string;
}

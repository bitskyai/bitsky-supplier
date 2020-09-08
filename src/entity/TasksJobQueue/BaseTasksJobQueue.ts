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
export abstract class BaseTasksJobQueue extends Base {
  @Column()
  agent_global_id: string;
}

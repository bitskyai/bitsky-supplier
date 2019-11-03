import { Column } from "typeorm";
import { isMongo } from "../../util/dbConfiguration";
import { BaseMongo, BaseSQL } from "../Base";
let Base: any;
if (isMongo()) {
  Base = BaseMongo;
} else {
  Base = BaseSQL;
}

export abstract class BaseServerInformation extends Base {
  @Column()
  name: string;

  @Column()
  version: string;

  @Column()
  description: string;

  @Column()
  migration_version: number;
}

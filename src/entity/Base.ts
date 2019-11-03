import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
  ObjectID,
  PrimaryGeneratedColumn
} from "typeorm";

export abstract class Base {
  @Column()
  global_id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  modified_at: string;
}

export abstract class BaseMongo extends Base {
  @ObjectIdColumn()
  id: ObjectID;
}

export abstract class BaseSQL extends Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

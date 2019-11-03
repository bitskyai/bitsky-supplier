import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class ServerInformation {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    version: string;

    @Column()
    description: string;

    @Column()
    migration_version: string;
}

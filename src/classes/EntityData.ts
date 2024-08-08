import { AutoIncrement, Column, DataType, Entity, Id } from "./Entity";

export class EntityData extends Entity{
    @Id
    @AutoIncrement
    @Column
    id!:number;

    @Column
    entityName!:string;

    @DataType("longtext")
    @Column
    entityInfo!:string;

    constructor(){
        super();
        this._tableName = "_entitydata";
    }

}
import { IEntity } from "./IEntity";

export interface IDictionary{
    insertQuery(table:string, columns:string[], ...values:any[]):string;
    updateQuery(table:string, values:object, where:object):string;
    selectQuery(table:string, where:object):string;
    deleteQuery(table:string, where:object):string;
    createTable(name:string, columns:object[], keys:string[]):string;
    modifyTable(name:string, columns:object[], keys:string[]):string;
    addColumn(name:string, column:object):string;
    dropColumn(name:string, column:object):string;
    dropTable(name:string):string;
    getLatestInserted(table:string):string;
    processAutoIncrementField(column:object):string;
}
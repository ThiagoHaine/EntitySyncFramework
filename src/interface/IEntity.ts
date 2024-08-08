export interface IEntity{
    _internalId:string;
    _tableName:string;

    _getPrimaryKey():string | null;
    _generateId():void;
}
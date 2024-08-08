export interface IEntity{
    _internalId:string;
    _tableName:string;
    _keys:string[];
    _registeredColumns:Column[];

    _getPrimaryKey():string | null;
    _generateId():void;
}

export type Column = {
    property:string;
    jsType:string;
    type:string;
    modifiers:string[];
}
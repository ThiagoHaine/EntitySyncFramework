import { Constructor } from "../classes/types/constructor";
import { IEntity } from "../interface/IEntity";

const typeRegistry: { [key: string]: EntityMap } = {};

export interface EntityColumnMap{
    name:string;
    type:string;
    modifiers:string[];
}

export interface EntityMap{
    tableName:string;
    constructor?:Constructor<any>;
    columns:EntityColumnMap[];
    keys:string[];
}

export function registerType(name:string) {
    if (!!typeRegistry[name]){return;}
    
    var map:EntityMap = {
        tableName: "",
        constructor: undefined,
        columns: [],
        keys: []
    };

    typeRegistry[name] = map;
}

export function registerEntity(entity:Constructor<IEntity>){
    let obj = new entity();
    registerType(entity.name);
    registerConstructor(entity);
    typeRegistry[entity.name].tableName = obj._tableName; 
}

export function registerConstructor(constructor:Constructor<any>){
    typeRegistry[constructor.name].constructor = constructor;
}

export function registerColumn(entity:string, column:string, type:string){
    typeRegistry[entity].columns = typeRegistry[entity].columns.filter(a=>a.name!=column);

    var map:EntityColumnMap = {
        name:column,
        type: type,
        modifiers: []
    };

    typeRegistry[entity].columns.push(map);
}

export function registerKey(entity:string, key:string){
    typeRegistry[entity].keys.push(key);
}

export function registerColumnModifier(entity:string, column:string, modifier:string){
    typeRegistry[entity].columns.find(a=>a.name==column)?.modifiers.push(modifier);
}

export function createInstanceByName(name: string): any {
    const type = typeRegistry[name];
    if (!type) {
        throw new Error(`Type ${name} not registered`);
    }

    if (!type.constructor){
        throw new Error(`Type ${name} not constructor registered`);
    }

    return new type.constructor();
}

export function getEntityInfo(name:string){
    const entity = typeRegistry[name];

    if (!entity){
        throw new Error("Entity not registered");
    }

    return entity;
}

export function parseType(val:string){
    switch(val.toLowerCase()){
        case "string":
        case "undefined":
            return "varchar(255)";
        case "number":
            return "int";
        case "bigint":
            return "long";
        case "boolean":
            return "bit";
        case "date":
            return "datetime";
        default:
            throw Error("Cannot parse type");
    }
}
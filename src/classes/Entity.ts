import { IEntity } from "../interface/IEntity";
import { v4 as uuidv4 } from 'uuid';
import { getEntityInfo, parseType, registerColumn, registerColumnModifier, registerConstructor, registerKey, registerType } from "../utils/TypeRegistry";
import 'reflect-metadata';

export function Id(target:any, propertyKey:string):void{
    registerKey(target.constructor.name, `PRIMARY KEY(${propertyKey})`);
}

export function Column(target: any, propertyKey: string): void {
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    const typeName = type ? type.name : undefined;

    registerType(target.constructor.name);
    registerConstructor(target.constructor);
    registerColumn(target.constructor.name, propertyKey, parseType(typeName));
}

export function NotNull(target: any, propertyKey: string): void {
    registerColumnModifier(target.constructor.name, propertyKey, "NOT NULL");
}

export function Unsigned(target: any, propertyKey: string): void {
    registerColumnModifier(target.constructor.name, propertyKey, "UNSIGNED");
}

export function AutoIncrement(target: any, propertyKey: string): void {
    registerColumnModifier(target.constructor.name, propertyKey, "@processAutoIncrementField");
}

export function DataType(type: string) {
    // Este é o decorator real que será aplicado ao método
    return function (target: any, propertyKey: string) {
        registerColumn(target.constructor.name, propertyKey, type);
    };
}


export class Entity implements IEntity{
    _keys: string[] = [];
    _tableName!: string;
    _internalId!: string;

    constructor(){
        this._keys = [];
    }
    
    _generateId(): void {
        this._internalId = uuidv4();
    }

    _getPrimaryKey(): string | null{
        try{
            let name = this.constructor.name;
            let info = getEntityInfo(name);
            let key = info.keys.find(a=>a.toUpperCase().includes("PRIMARY"));

            if (!key){
                return null;
            }

            return key
                    .trim()
                    .split("(")[1]
                    .trim()
                    .split(")")[0]
                    .trim();
        }catch{
            return null;
        }
    }
}
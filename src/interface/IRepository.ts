import { IConnector } from "./IConnector";

export interface IRepository<IEntity>{
    _connector:IConnector;
    _obj:IEntity;
    
    save(entity:IEntity):Promise<IEntity>;
    getAll():Promise<IEntity[]>;
    getById(id:number):Promise<IEntity | null>;
    deleteById(id:number):void;
    deleteAll(entityList:IEntity[]):void;
    _configure():Promise<void>;
}
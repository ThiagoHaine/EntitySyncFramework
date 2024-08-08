import { IDictionary } from "./IDictionary";
import { IEntity } from "./IEntity";
import { IRepository } from "./IRepository";
import { Constructor } from "../classes/types/constructor";

export interface IConnector{
    _dictionary:IDictionary;
    connect(host: string, username: string, password: string, db: string, port: number | undefined): Promise<void>;
    runQuery(query:string):Promise<void>;
    runAndReturn(query:string):Promise<IEntity | null>;
    runAndReturnString(query:string):Promise<string>;
    runAndReturnList(query:string):Promise<IEntity[]>;
    mapRepositorys(repositorys: Constructor<IRepository<IEntity>>[]):Promise<void>;
    getRepository(entity:Constructor<IEntity>):IRepository<IEntity> | null;
    getTableUid(name:string):Promise<string>;
}
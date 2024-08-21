import { IConnector } from "../interface/IConnector";
import { IDictionary } from "../interface/IDictionary";
import { IEntity } from "../interface/IEntity";
import { IRepository } from "../interface/IRepository";
import { Constructor } from "./types/constructor";

export class GenericConnector implements IConnector{
    _dictionary!: IDictionary;
    _repositorys: IRepository<IEntity>[] = [];

    connect(host: string, username: string, password: string, db: string, port: number | undefined=undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }
    runQuery(query: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    runAndReturn(query: string): Promise<IEntity | null> {
        throw new Error("Method not implemented.");
    }
    runAndReturnString(query: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    runAndReturnList(query: string): Promise<IEntity[]> {
        throw new Error("Method not implemented.");
    }
    mapRepositorys(repositorys: Constructor<IRepository<IEntity>>[]):Promise<void> {
        return new Promise(async resolve=>{
            for(let i=0;i<repositorys.length;i++){
                let n = new repositorys[i](this);
                await n._configure();
    
                this._repositorys.push(n);
            }

            resolve();
        });
    }
    getRepository<T extends IEntity>(entity: Constructor<T>): IRepository<T> | null{
        let newObj = new entity();
        let repository = this._repositorys.find(a=>a._obj.constructor.name == newObj.constructor.name);
        return (repository || null) as unknown as IRepository<T> | null;
    }
    getTableUid(name: string): Promise<string> {
        throw new Error("Method not implemented.");
    }   
}
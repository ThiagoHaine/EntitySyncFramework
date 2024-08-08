import { IConnector } from "../interface/IConnector";
import { IDictionary } from "../interface/IDictionary";
import { IEntity } from "../interface/IEntity";
import { IRepository } from "../interface/IRepository";
import { EntityMap, createInstanceByName, getEntityInfo, parseType } from "../utils/TypeRegistry";
import { Entity } from "./Entity";
import { EntityData } from "./EntityData";

export class Repository<T extends Entity> implements IRepository<IEntity>{
    _connector!: IConnector;
    _obj!:IEntity;
    _dict!:IDictionary;

    constructor(connector:IConnector){
        this._connector = connector;
        this._obj = createInstanceByName(this.constructor.name.replace("Repository", ""));
        this._dict = this._connector._dictionary;
    }

    async save(entity: IEntity): Promise<IEntity> {
        let idKey = this._obj._getPrimaryKey();
        let tableName = this._obj._tableName;
        let entityName = this.constructor.name.replace("Repository", "");
        let entityInfo = getEntityInfo(entityName);

        if (idKey!=null){            
            if (!!(entity as any)[idKey]){
                let valuesObj = {} as any;
                let whereObj = {} as any;

                whereObj[idKey] = (entity as any)[idKey];

                
                entityInfo.columns.forEach(c=>{
                    if (c.name==idKey){
                        return;
                    }

                    let value = (entity as any)[c.name] || "null";
                    valuesObj[c.name] = value;
                });

                await this._connector.runQuery(
                    this._dict.updateQuery(tableName, valuesObj, whereObj)
                );
                return entity;
            }else{
                let values = [] as any[];

                entityInfo.columns.forEach(c=>{
                    if (c.name==idKey){
                        values.push("null");
                    }else{
                        let value = (entity as any)[c.name] || "null";

                        values.push(value);
                    }
                });
                await this._connector.runQuery(
                    this._dict.insertQuery(tableName, entityInfo.columns.map(c=>c.name), ...values)
                );
                let newId = await this._connector.runAndReturnString(
                    this._dict.getLatestInserted(tableName)
                );

                (entity as any)[idKey] = parseInt(newId);

                return entity;
            }
        }else{
            throw new Error("Entity has no Key Identifier");
        }
    }

    async getAll(): Promise<IEntity[]> {
        return await this._connector.runAndReturnList(
            this._dict.selectQuery(this._obj._tableName, {})
        );
    }

    async getById(id: number): Promise<IEntity | null> {
        let idKey = this._obj._getPrimaryKey();

        if (idKey!=null){
            let whereObj = {} as any;
            whereObj[idKey] = id;
    
            return await this._connector.runAndReturn(
                this._dict.selectQuery(this._obj._tableName, whereObj)
            );
        }else{
            throw new Error("Entity has no Key Identifier");
        }
    }

    deleteById(id: number): void {
        let idKey = this._obj._getPrimaryKey();

        if (idKey!=null){
            let whereObj = {} as any;
            whereObj[idKey] = id;
            this._connector.runQuery(
                this._dict.deleteQuery(this._obj._tableName, whereObj)
            );
        }else{
            throw new Error("Entity has no Key Identifier");
        }
    }

    deleteAll(entityList: Entity[]): void {
        let idKey = this._obj._getPrimaryKey();

        if (idKey!=null){
            entityList.forEach(e=>{
                this.deleteById((e as any)[idKey]);
           });
        }else{
            throw new Error("Entity has no Key Identifier");
        }
    }

    async getEntityData(){
        let entityData;
        let entityInfo = getEntityInfo("EntityData");

        try{
            entityData = (await this._connector.runAndReturnList(this._dict.selectQuery(entityInfo.tableName, {})));
        }catch{
            (await this._connector.runQuery(this._dict.createTable(entityInfo.tableName, entityInfo.columns, entityInfo.keys)));
        }finally{
            entityData = (await this._connector.runAndReturnList(this._dict.selectQuery(entityInfo.tableName, {})));
        }

        return entityData as EntityData[];
    }

    async _configure(): Promise<void> {
        //Current table
        let entityName = this.constructor.name.replace("Repository", "");
        let entityInfo = getEntityInfo(entityName);

        //Tracking table
        let entityData = await this.getEntityData();
        let entityDataInfo = getEntityInfo("EntityData");
        
        let currentInfo = entityData.find(a=>a.entityName == entityName);
        let newInfo = JSON.stringify({...entityInfo, constructor: null});
        let updateInfo = true;

        if (!currentInfo){
            (await this._connector.runQuery(this._dict.dropTable(entityInfo.tableName)));
            (await this._connector.runQuery(this._dict.createTable(entityInfo.tableName, entityInfo.columns, entityInfo.keys)));
        }else{
            let currentInfoData = decodeURIComponent(currentInfo.entityInfo);

            if (newInfo!=currentInfoData){
                let currentInfoParsed = JSON.parse(currentInfoData) as EntityMap;
                let changedColumns = [];
                let newColumns = [];
                let removedColumns = [];

                removedColumns = currentInfoParsed.columns.filter(a=>!entityInfo.columns.find(b=>b.name==a.name));
                newColumns = entityInfo.columns.filter(a=>!currentInfoParsed.columns.find(b=>b.name==a.name));
                changedColumns = entityInfo.columns.filter(a=>!removedColumns.find(b=>b.name==a.name) && !newColumns.find(b=>b.name==a.name));
                changedColumns = changedColumns.filter(a=>!currentInfoParsed.columns.find(b=>JSON.stringify(a)==JSON.stringify(b)));

                if (removedColumns.length>0){
                    for(let i=0;i<removedColumns.length;i++){
                        let removedColumn = removedColumns[i];
                        (await this._connector.runQuery(this._dict.dropColumn(entityInfo.tableName, removedColumn)));    
                    }
                }
                
                if (newColumns.length>0){
                    for(let i=0;i<newColumns.length;i++){
                        let newColumn = newColumns[i];
                        (await this._connector.runQuery(this._dict.addColumn(entityInfo.tableName, newColumn)));    
                    }
                }
                
                if (changedColumns.length>0){
                    (await this._connector.runQuery(this._dict.modifyTable(entityInfo.tableName, changedColumns, entityInfo.keys)));
                }
            }else{
                updateInfo = false;
            }
        }

        if (updateInfo){
            //Atualiza a informação na tabela de tracking
            (await this._connector.runQuery(this._dict.deleteQuery(entityDataInfo.tableName, {"entityName": entityName})));
            (await this._connector.runQuery(this._dict.insertQuery(entityDataInfo.tableName, ["entityName", "entityInfo"], entityName, encodeURIComponent(newInfo))));
        }
    }
}
import { ConnectionOptions } from "tls";
import { GenericConnector } from "../classes/GenericConnector";
import { MysqlDictionary } from "../dictionarys/MysqlDictionary";
import { IConnector } from "../interface/IConnector";
import { IDictionary } from "../interface/IDictionary";
import { IEntity } from "../interface/IEntity";
import mysql from 'mysql2/promise';
import { IRepository } from "../interface/IRepository";
import { registerEntity } from "../utils/TypeRegistry";
import { EntityData } from "../classes/EntityData";


export class MysqlConnector extends GenericConnector {
    _dictionary: IDictionary;
    private _connection!: mysql.Connection;

    constructor() {
        super();
        this._dictionary = new MysqlDictionary();
        registerEntity(EntityData);
    }

    connect(host: string, username: string, password: string, db: string, port: number | undefined=undefined): Promise<void> {
        return new Promise(resolve=>{
            mysql.createConnection({
                host: host,
                user: username,
                password: password,
                database: db,
                port: port,
                typeCast: function(field, next){
                    if (field.type === 'BIT' && field.length === 1) {
                        const bytes = field.buffer();
                        return bytes ? bytes[0] === 1 : false;
                    }
                    return next();
                }
            }).then(conn=>{
                this._connection = conn;
                resolve();
            })
        })
    }

    runQuery(query: string): Promise<void> {
        return new Promise((resolve,reject)=>{
            this._connection.query(query).then(_=>resolve()).catch(err=>reject(err));
        })
    }

    runAndReturn(query: string): Promise<IEntity | null> {
        return new Promise((resolve,reject)=>{
            this._connection.query(query).then(([rows,fields])=>{
                if ((rows as any[]).length>0){
                    resolve((rows as any[])[0]);
                }else{
                    resolve(null);
                }
            }).catch(err=>reject(err))
        })
    }

    runAndReturnString(query: string): Promise<string> {
        return new Promise((resolve,reject)=>{
            this._connection.query(query).then(([rows,fields])=>{
                if ((rows as any[]).length>0){
                    let key = Object.keys((rows as any[])[0])[0];
                    resolve((rows as any[])[0][key].toString());
                }else{
                    resolve("");
                }
            }).catch(err=>reject(err))
        })
    }
    

    runAndReturnList(query: string): Promise<IEntity[]> {
        return new Promise((resolve,reject)=>{
            this._connection.query(query).then(([rows,fields])=>{
                resolve(rows as any[]);
            }).catch(err=>reject(err))
        })
    }

    async getTableUid(name: string): Promise<string> {
        let sql = `SELECT CONCAT(COLUMN_NAME,":",DATA_TYPE) as cs FROM information_schema.COLUMNS WHERE TABLE_NAME = '${name}' AND TABLE_SCHEMA = DATABASE() ORDER BY COLUMN_NAME ASC`;

        let result = await this.runAndReturnList(sql) as any[];
        return result.map(r=>r.cs).sort((a,b)=>a>b?1:-1).join(",");
    }
}

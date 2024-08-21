// index.d.ts
declare module 'entitysyncframework' {
    // Interfaces
    export type Constructor<T> = new (...args: any[]) => T;

    export interface IConnector {
        _dictionary: IDictionary;
        connect(host: string, username: string, password: string, db: string, port: number | undefined): Promise<void>;
        runQuery(query: string): Promise<void>;
        runAndReturn(query: string): Promise<IEntity | null>;
        runAndReturnString(query: string): Promise<string>;
        runAndReturnList(query: string): Promise<IEntity[]>;
        mapRepositorys(repositorys: Constructor<IRepository<IEntity>>[]): Promise<void>;
        getRepository<T extends IEntity>(entity: Constructor<T>): IRepository<T> | null;
        getTableUid(name: string): Promise<string>;
    }

    export interface IDictionary {
        insertQuery(table: string, columns: string[], ...values: any[]): string;
        updateQuery(table: string, values: object, where: object): string;
        selectQuery(table: string, where: object): string;
        deleteQuery(table: string, where: object): string;
        createTable(name: string, columns: object[], keys: string[]): string;
        modifyTable(name: string, columns: object[], keys: string[]): string;
        addColumn(name: string, column: EntityColumnMap): string;
        dropColumn(name: string, column: EntityColumnMap): string;
        dropTable(name: string): string;
        getLatestInserted(table: string): string;
        processAutoIncrementField(column: any): string;
    }

    export interface IEntity {
        _internalId: string;
        _tableName: string;
        _keys: string[];
        _registeredColumns: any[];

        _getPrimaryKey(): string | null;
        _generateId(): void;
    }

    export interface IRepository<T extends IEntity> {
        _connector: IConnector;
        _obj: T;

        save(entity: T): Promise<T>;
        getAll(): Promise<T[]>;
        getById(id: number): Promise<T | null>;
        deleteById(id: number): void;
        deleteAll(entityList: T[]): void;
        _configure(): Promise<void>;
    }

    export interface EntityColumnMap {
        name: string;
        type: string;
        modifiers: string[];
    }

    export interface EntityMap {
        tableName: string;
        constructor?: Constructor<any>;
        columns: EntityColumnMap[];
        keys: string[];
    }

    // Classes

    export class MysqlDictionary implements IDictionary {
        addColumn(name: string, column: EntityColumnMap): string;
        dropColumn(name: string, column: EntityColumnMap): string;
        modifyTable(name: string, columns: EntityColumnMap[], keys: string[]): string;
        processAutoIncrementField(column: any): string;
        insertQuery(table: string, columns: string[], ...values: any[]): string;
        updateQuery(table: string, values: object, where: object): string;
        selectQuery(table: string, where: object): string;
        deleteQuery(table: string, where: object): string;
        createTable(name: string, columns: EntityColumnMap[], keys: string[]): string;
        dropTable(name: string): string;
        getLatestInserted(table: string): string;
    }

    export class MysqlConnector extends GenericConnector implements IConnector {
        _dictionary: IDictionary;
        private _connection: any;

        constructor();
        connect(host: string, username: string, password: string, db: string, port: number | undefined): Promise<void>;
        runQuery(query: string): Promise<void>;
        runAndReturn(query: string): Promise<IEntity | null>;
        runAndReturnString(query: string): Promise<string>;
        runAndReturnList(query: string): Promise<IEntity[]>;
        getTableUid(name: string): Promise<string>;
    }

    export class GenericConnector implements IConnector {
        _dictionary: IDictionary;
        _repositorys: IRepository<IEntity>[];

        connect(host: string, username: string, password: string, db: string, port: number | undefined): Promise<void>;
        runQuery(query: string): Promise<void>;
        runAndReturn(query: string): Promise<IEntity | null>;
        runAndReturnString(query: string): Promise<string>;
        runAndReturnList(query: string): Promise<IEntity[]>;
        mapRepositorys(repositorys: Constructor<IRepository<IEntity>>[]): Promise<void>;
        getRepository<T extends IEntity>(entity: Constructor<T>): IRepository<T> | null;
        getTableUid(name: string): Promise<string>;
    }

    export class Repository<T extends IEntity> implements IRepository<T> {
        _connector: IConnector;
        _obj: T;

        save(entity: T): Promise<T>;
        getAll(): Promise<T[]>;
        getById(id: number): Promise<T | null>;
        deleteById(id: number): void;
        deleteAll(entityList: T[]): void;
        _configure(): Promise<void>;
    }

    export class Entity implements IEntity {
        _internalId: string;
        _tableName: string;
        _keys: string[];
        _registeredColumns: any[];

        _getPrimaryKey(): string | null;
        _generateId(): void;
    }

    // Decorators

    export function DataType(type: string): ClassDecorator;
    export function AutoIncrement(target: any, propertyKey: string): void;
    export function Unsigned(target: any, propertyKey: string): void;
    export function NotNull(target: any, propertyKey: string): void;
    export function Column(target: any, propertyKey: string): void;
    export function Id(target: any, propertyKey: string): void;


    //Utils
    export function registerType(name:string):void;
    export function registerEntity(entity:Constructor<IEntity>):void;
    export function registerConstructor(constructor:Constructor<any>):void;
    export function registerColumn(entity:string, column:string, type:string):void;
    export function registerKey(entity:string, key:string):void;
    export function registerColumnModifier(entity:string, column:string, modifier:string):void;
    export function createInstanceByName(name: string): IEntity;
    export function getEntityInfo(name:string):EntityMap;
    export function parseType(val:string):string;
}
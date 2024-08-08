import { IDictionary } from "../interface/IDictionary";
import { Column, IEntity } from "../interface/IEntity";
import { EntityColumnMap, parseType } from "../utils/TypeRegistry";

export class MysqlDictionary implements IDictionary {
    addColumn(name: string, column: EntityColumnMap): string {
        let str = [column.name, column.type];

        column.modifiers.forEach(m=>{
            if (m[0]=="@"){
                m = (this as any)[m.slice(1)]();
            }

            str.push(m);
        })

        return `ALTER TABLE ${name} ADD ${str.join(" ")}`;
    }
    dropColumn(name: string, column: EntityColumnMap): string {
        return `ALTER TABLE ${name} DROP COLUMN ${column.name}`;
    }
    modifyTable(name: string, columns: EntityColumnMap[], keys: string[]): string {
        let columnsDefinition:string[] = [];

        columns.forEach(c=>{
            let str = ["MODIFY COLUMN", c.name, c.type];

            c.modifiers.forEach(m=>{
                if (m[0]=="@"){
                    m = (this as any)[m.slice(1)]();
                }

                str.push(m);
            })

            columnsDefinition.push(str.join(" "));
        })

        return `ALTER TABLE ${name} ${columnsDefinition.join(", ")}`;
    }

    processAutoIncrementField(column: Column): string {
        return "AUTO_INCREMENT";
    }

    insertQuery(table: string, columns: string[], ...values: any[]): string {
        values = values.map(v => {
            if (v=="null"){
                return v;
            }
            if (typeof v === "string") {
                return `'${v}'`;
            }
            if (typeof v === "boolean"){
                return v ? "1" : "0";
            }
            return v;
        });

        return `INSERT INTO ${table}(${columns.join(",")}) VALUES (${values.join(",")})`;
    }

    updateQuery(table: string, values: object, where: object): string {
        const setClause = Object.keys(values).map(key => {
            let value = (values as any)[key];
            if (value=="null"){
                value = value;
            }else
            if (typeof value === "string") {
                value = `'${value}'`;
            }else
            if (typeof value === "boolean"){
                value = value ? "1" : "0";
            }
            return `${key}=${value}`;
        }).join(", ");

        const whereClause = Object.keys(where).map(key => {
            let value = (where as any)[key];
            if (value=="null"){
                value = value;
            }else
            if (typeof value === "string") {
                value = `'${value}'`;
            }else
            if (typeof value === "boolean"){
                value = value ? 1 : 0;
            }
            return `${key}=${value}`;
        }).join(" AND ");

        return `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    }

    selectQuery(table: string, where: object): string {
        const whereClause = Object.keys(where).map(key => {
            let value = (where as any)[key];
            if (typeof value === "string") {
                value = `'${value}'`;
            }
            return `${key}=${value}`;
        }).join(" AND ");

        return `SELECT * FROM ${table} ${!!whereClause ? `WHERE ${whereClause}` : ''}`;
    }

    deleteQuery(table: string, where: object): string {
        const whereClause = Object.keys(where).map(key => {
            let value = (where as any)[key];
            if (typeof value === "string") {
                value = `'${value}'`;
            }
            return `${key}=${value}`;
        }).join(" AND ");

        return `DELETE FROM ${table} WHERE ${whereClause}`;
    }

    createTable(name: string, columns: EntityColumnMap[], keys: string[]): string {
        let columnsDefinition:string[] = [];

        columns.forEach(c=>{
            let str = [c.name, c.type];

            c.modifiers.forEach(m=>{
                if (m[0]=="@"){
                    m = (this as any)[m.slice(1)]();
                }

                str.push(m);
            })

            columnsDefinition.push(str.join(" "));
        })

        columnsDefinition.push(...keys)

        return `CREATE TABLE ${name} (${columnsDefinition.join(", ")})`;
    }

    dropTable(name: string): string {
        return `DROP TABLE IF EXISTS ${name}`;
    }

    getLatestInserted(table: string): string {
        return `SELECT LAST_INSERT_ID()`;
    }
}

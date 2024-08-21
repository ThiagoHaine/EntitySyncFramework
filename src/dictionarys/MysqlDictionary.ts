import { IDictionary } from "../interface/IDictionary";
import moment from 'moment';
import { EntityColumnMap, parseType } from "../utils/TypeRegistry";

export class MysqlDictionary implements IDictionary {
    parseValue(value:any):string{
        if (value=="null" || value==null || value==undefined){
            return "null";
        }
        if (value instanceof Date){
            return `'${moment(value).format("YYYY-MM-DD HH:mm:ss")}'`;
        }
        if (typeof value === "string") {
            return `'${value}'`;
        }
        if (typeof value === "boolean"){
            return value ? "1" : "0";
        }
        return value;
    }

    addColumn(name: string, column: EntityColumnMap): string {
        let str = [`\`${column.name}\``, column.type];

        column.modifiers.forEach(m=>{
            if (m[0]=="@"){
                m = (this as any)[m.slice(1)]();
            }

            str.push(m);
        })

        return `ALTER TABLE \`${name}\` ADD ${str.join(" ")}`;
    }
    dropColumn(name: string, column: EntityColumnMap): string {
        return `ALTER TABLE \`${name}\` DROP COLUMN \`${column.name}\``;
    }
    modifyTable(name: string, columns: EntityColumnMap[], keys: string[]): string {
        let columnsDefinition:string[] = [];

        columns.forEach(c=>{
            let str = ["MODIFY COLUMN", `\`${c.name}\``, c.type];

            c.modifiers.forEach(m=>{
                if (m[0]=="@"){
                    m = (this as any)[m.slice(1)]();
                }

                str.push(m);
            })

            columnsDefinition.push(str.join(" "));
        })

        return `ALTER TABLE \`${name}\` ${columnsDefinition.join(", ")}`;
    }

    processAutoIncrementField(column: any): string {
        return "AUTO_INCREMENT";
    }

    insertQuery(table: string, columns: string[], ...values: any[]): string {
        values = values.map(v=>this.parseValue(v));

        return `INSERT INTO \`${table}\`(\`${columns.join("`,`")}\`) VALUES (${values.join(",")})`;
    }

    updateQuery(table: string, values: object, where: object): string {
        const setClause = Object.keys(values).map(key => `\`${key}\`=${this.parseValue((values as any)[key])}`).join(", ");
        const whereClause = Object.keys(where).map(key => `\`${key}\`=${this.parseValue((where as any)[key])}`).join(" AND ");

        return `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
    }

    selectQuery(table: string, where: object): string {
        const whereClause = Object.keys(where).map(key => `\`${key}\`=${this.parseValue((where as any)[key])}`).join(" AND ");

        return `SELECT * FROM \`${table}\` ${!!whereClause ? `WHERE ${whereClause}` : ''}`;
    }

    deleteQuery(table: string, where: object): string {
        const whereClause = Object.keys(where).map(key => `${key}=${this.parseValue((where as any)[key])}`).join(" AND ");

        return `DELETE FROM \`${table}\` WHERE ${whereClause}`;
    }

    createTable(name: string, columns: EntityColumnMap[], keys: string[]): string {
        let columnsDefinition:string[] = [];

        columns.forEach(c=>{
            let str = [`\`${c.name}\``, c.type];

            c.modifiers.forEach(m=>{
                if (m[0]=="@"){
                    m = (this as any)[m.slice(1)]();
                }

                str.push(m);
            })

            columnsDefinition.push(str.join(" "));
        })

        columnsDefinition.push(...keys)

        return `CREATE TABLE \`${name}\` (${columnsDefinition.join(", ")})`;
    }

    dropTable(name: string): string {
        return `DROP TABLE IF EXISTS \`${name}\``;
    }

    getLatestInserted(table: string): string {
        return `SELECT LAST_INSERT_ID()`;
    }
}

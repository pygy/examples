import { Database } from "electric-sql/browser";
import { Todo } from "./model";

export type Filter = {
    listId: string
    completed?: boolean
}

export class TodoRepository{
    private db: Database

    constructor(db: Database){
        this.db = db
    }

    async save(todo: Todo): Promise<void> {
        const sql = "INSERT INTO todo(id, listId, text) VALUES (?, ?, ?)"
        const args = [todo.id, todo.listId, todo.text]
        
        console.log(`SQL: ${sql}, ${args}`)
        await this.db.run(sql, args)
    }

    async update(todo: Todo): Promise<void> {
        const sql = "UPDATE todo SET text = ?, completed = ? WHERE id = ?"
        const args = [todo.text, todo.completed ? 1 : 0, todo.id,]
        
        console.log(`SQL: ${sql}, ${args}`)
        await this.db.run(sql, args)
    }

    async delete(todo: Todo): Promise<void> {
        const sql = "DELETE FROM todo WHERE id = ?"
        const args = [todo.id]
        
        console.log(`SQL: ${sql}, ${args}`)
        await this.db.run(sql, args)
    }

    async deleteAll(filter: Filter): Promise<void> {
        const sql = "DELETE FROM todo WHERE completed = ?"
        const args = [filter ? 1 : 0]
        
        console.log(`SQL: ${sql}, ${args}`)
        await this.db.run(sql, args)
    }

    async list(filter: Filter): Promise<Todo[]> {
        let sql = "SELECT id, listId, text, completed FROM todo"
        const where = []
        const args = []
        if(filter.listId){
            where.push("listId = ?")
            args.push(filter.listId)
        }
        if(filter.completed != undefined){
            where.push("completed = ?")
            args.push(filter.completed ? 1 : 0)
        }

        if(where.length > 0){
            sql = sql + " WHERE " + where.join(" AND ")
        }

        console.log(`SQL: ${sql} ${args}`)
        
        const res = await this.db.exec(sql, args)
        console.log(`res: ${JSON.stringify(res)}`)
        
        if (res.length == 0){
            return []
        }

        const {columns, values} = res[0]
        return values.map((value : any) => ({
            id: value[columns.indexOf("id")],
            listId: value[columns.indexOf("listId")],
            text: value[columns.indexOf("text")],
            completed: value[columns.indexOf("completed")]
        }))
    }
}
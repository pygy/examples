import { Database } from "electric-sql/browser";
import { TodoList } from "./model";

export class TodoListRepository{
    private db: Database

    constructor(db: Database){
        this.db = db
    }

    async getById(listId: string): Promise<TodoList> {
        const sql = `SELECT id, editing, filter FROM todolist WHERE id = ?`
        const args = [listId]

        const res = await this.db.exec(sql, args)
        
        if(res.length == 0){
            throw new Error(`Couldn't find TodoList with id ${listId}`)
        }

        const {columns, values} = res[0]
        return {
            id: values[0][columns.indexOf("id")] as any,
            editing: values[0][columns.indexOf("editing")] as any,
            filter: values[0][columns.indexOf("filter")] as any,
        }
    }

    async update(todoList: TodoList): Promise<void> {
        let sql = "UPDATE todolist"
        const set: string[] = []
        const args = []

        if(todoList.editing){
            set.push("editing = ?")
            args.push(todoList.editing)
        }

        if(todoList.filter){
            set.push("filter = ?")
            args.push(todoList.filter)
        }
        
        if(set.length == 0){
            throw new Error("filter or editing must be set")
        }

        args.push(todoList.id)
        sql = `UPDATE todolist SET ${set.join(" , ")} WHERE id = ?`

        console.log(`SQL: ${sql}, ${args}`)
        await this.db.run(sql, args)
    }
}
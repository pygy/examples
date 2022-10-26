import { v4 as uuid } from 'uuid';
export type TodoList = any

export class Todo {
    id: string;
    listId: string;
    text: string;
    completed: boolean;

    static create(listId: string, text: string) : Todo {
        return new Todo(uuid(), listId, text)
    }

    constructor(id: string, listId:string, text: string, completed?: boolean){
        this.id = id
        this.listId = listId
        this.text = text
        this.completed = completed || false
    }
}

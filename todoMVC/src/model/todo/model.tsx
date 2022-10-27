export type TodoList = any

export type Todo = {
    id: string
    listId: string
    text: string
    completed: boolean
    }
    
export function createTodo(id: string, listId: string, text: string, completed?: boolean) : Todo {
        return {id, listId, text, completed: completed || false}
}
type FilterValues = "all" | "active" | "completed"

export type TodoList = {
    id: string
    filter?: FilterValues
    editing?: string | null
}

export function createTodoList(id: string, filter: FilterValues, editing?: string | null): TodoList {
    return { id, filter, editing }
}


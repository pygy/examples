type FilterValues = "all" | "active" | "completed"

export type TodoList = {
    id: string
    filter?: FilterValues
    editing?: string | null
}

export const createTodoList = (id: string, filter: FilterValues, editing?: string | null): TodoList => {
    return { id, filter, editing }
}

export const resultsToTodoList = (r: any) => (createTodoList(r.id, r.editing, r.filter))


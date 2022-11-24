export type TodoList = any

export type Todo = {
    id: string
    listId: string
    text: string
    completed: boolean
    }
    
export const createTodo = (id: string, listId: string, text: string, completed?: boolean) : Todo => {
        return {id, listId, text, completed: completed || false}
}

export const resultsToTodos = (todos: any[]) => {
    const { all, active, completed }: { all: Todo[], active: Todo[], completed: Todo[] } =
      { all: [], active: [], completed: [] }
  
    todos.map((t: any) => {
      const todo = createTodo(t.id, t.listId, t.text, t.completed == 1 ? true : false)
      all.push(todo)
      if (t.completed) {
        completed.push(todo)
      } else {
        active.push(todo)
      }
    })
  
    return { all, active, completed }
  }
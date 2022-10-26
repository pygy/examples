import React, { memo, useCallback, useEffect, useState } from 'react'
import './App.css'
import './style.css'

import { Todo, TodoList } from './model/todo/model'
import { ElectrifiedDatabase, initElectricSqlJs } from 'electric-sql/browser'
import { ElectricProvider } from 'electric-sql/react'
import { TodoRepository } from './model/todo/repository'
import { TodoListRepository } from './model/todolist/repository'

const worker = new Worker("./worker.js", { type: "module" });

function Header({ listId, repository }: { listId: string, repository: TodoRepository }) {
  const [newText, setNewText] = useState<string>("")
  
  return (    
    <header className="header">
      <h1>todos</h1>
      <input
        type="text"
        className="new-todo"
        placeholder="What needs to be done?"
        autoFocus
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
        onKeyUp={(e) => {
          const target = e.target as HTMLInputElement;
          if (e.key === "Enter" && target.value.trim() !== "") {
            const todo = Todo.create(listId, target.value)
            repository.save(todo)            
            setNewText("");
          }
        }}
      />
    </header>
  )
}

const TodoView = memo(
  ({
    todo,
    editing,
    startEditing,
    saveTodo,
    toggleTodo,
    deleteTodo
  }: {
    key?: any;
    todo: Todo;
    editing: boolean;
    startEditing: (t: Todo) => void;
    saveTodo: (todo: Todo, text: string) => void;
    toggleTodo: (todo: Todo) => void;
    deleteTodo: (todo: Todo) => void;
  }) => {
    let body;

    const [text, setText] = useState(todo.text);
    // useBind(todo, ["text", "completed"]);
    
    if (editing) {
      body = (
        <input
          type="text"
          className="edit"
          autoFocus
          value={text}
          onBlur={() => saveTodo(todo, text)}
          onKeyUp={(e) => e.key === "Enter" && saveTodo(todo, text)}
          onChange={(e) => setText(e.target.value)}
        />
      );
    } else {
      body = (
        <div className="view">
          <input
            type="checkbox"
            className="toggle"
            checked={todo.completed}
            onChange={() => toggleTodo(todo)}
          />
          <label onDoubleClick={() => startEditing(todo)}>{todo.text}</label>
          <button className="destroy" onClick={() => deleteTodo(todo)} />
        </div>
      );
    }
    return (
      <li
        className={
          (todo.completed ? "completed " : "") + (editing ? "editing" : "")
        }
      >
        {body}
      </li>
    );
  }
);

function Footer({
  remaining,
  todos,
  clearCompleted,
  todoList,
  updateTodoList,
}: {
  remaining: number;
  todos: Todo[];
  clearCompleted: () => void;
  todoList: TodoList;
  updateTodoList: (list: TodoList) => Promise<void>
}) {
  let clearCompletedButton;
  if (remaining !== todos.length) {
    clearCompletedButton = (
      <button className="clear-completed" onClick={clearCompleted}>
        Clear completed
      </button>
    );
  }

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong> {remaining} </strong>
        {remaining === 1 ? "item" : "items"} left
      </span>
      <ul className="filters">
        <li>
          <a
            className={todoList.filter === "all" ? "selected" : ""}
            onClick={() => updateTodoList({...todoList, filter: "all"})}
          >
            {" "}
            All{" "}
          </a>
        </li>
        <li>
          <a
            className={todoList.filter === "active" ? "selected" : ""}
            onClick={() => updateTodoList({...todoList, filter: "active"})}
          >
            Active
          </a>
        </li>
        <li>
          <a
            className={todoList.filter === "completed" ? "selected" : ""}
            onClick={() => updateTodoList({...todoList, filter: "completed"})}
          >
            Completed
          </a>
        </li>
      </ul>
      {clearCompletedButton}
    </footer>
  );
}

type TodoState = {
  todoList?: TodoList
  all?: Todo[]
  active?: Todo[]
  completed?: Todo[]
}

function TodoMVC({ listId, todoRepo, todoListRepo }: { listId: string, todoRepo: TodoRepository, todoListRepo: TodoListRepository }) {
  const [state, setState] = useState<TodoState>()
  const startEditing = useCallback(() => undefined,[listId])
  
  const saveTodo = (todo: Todo, text: string) => todoRepo.update({...todo, text})
  const deleteTodo = (todo: Todo) => todoRepo.delete(todo)
  const toggleTodo = (todo: Todo) => todoRepo.update({...todo, completed: !todo.completed})
  
  // shall we use deleteAll/saveAll?
  const clearCompleted = () => completed.map( c => todoRepo.delete(c))
  
  const toggleAll = () => {
    if (remaining === 0) {
      completed.map( c => todoRepo.update({...c, completed: false}))
    } else {
      active.map( c => todoRepo.update({...c, completed: true}))
    }
  }

  const updateTodoList = (list: TodoList): Promise<void> => todoListRepo.update(list)
  
  useEffect(() => {
    const init = async () => {

      const todoList = await todoListRepo.getById(listId)  

      // shall we make a single query and filter out here?
      const active = await todoRepo.list({listId, completed: false})  
      const completed = await todoRepo.list({listId, completed: true})  
      const all = await todoRepo.list({listId})  

      setState({todoList, active, completed, all})
    }

    init()
  }, [])

  if (!state?.active || !state?.completed || !state.all){
    console.log("not rendering todoMVC")  
    return null
  }
  
  const {todoList, active, completed, all} = state

  const remaining = active.length;
  let todos = todoList.filter === "active"
      ? active
      : todoList.filter === "completed"
      ? completed
      : all

  let toggleAllCheck;
  if (all.length) {
    toggleAllCheck = (
      <>
        <input
          id="toggle-all"
          type="checkbox"
          className="toggle-all"
          checked={remaining === 0}
          onChange={toggleAll}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
      </>
    );
  }

  console.log(`rendering todoMVC ${JSON.stringify(all)}`)
  return (
    <div className="todoapp">      
        <Header listId={listId} repository={todoRepo} />
        <section
          className="main"
          style={all.length > 0 ? {} : { display: "none" }}
        >
          {toggleAllCheck}
          <ul className="todo-list">
            {todos.map((t: any) => (
              <TodoView
                key={t.id}
                todo={t}
                editing={todoList.editing === t.id}
                startEditing={startEditing}
                saveTodo={saveTodo}
                deleteTodo={deleteTodo}
                toggleTodo={toggleTodo}
              />
            ))}
          </ul>
          <Footer
            remaining={remaining}
            todos={all}
            todoList={todoList}
            clearCompleted={clearCompleted}
            updateTodoList={updateTodoList}
          />
        </section>
    </div>
  );
}

function ElectrifiedTodoMVC({ listId }: { listId: string }) {
  const [ db, setDb ] = useState<ElectrifiedDatabase>()
  const [ todoRepository, setTodosRepository ] = useState<TodoRepository>()
  const [ todoListRepository, setTodoListRepository ] = useState<TodoListRepository>()

  useEffect(() => {
    console.log("use effect")
    const init = async () => {
      const SQL = await initElectricSqlJs(worker, {locateFile: (file: string) => `/${file}`})
      const electrified = await SQL.openDatabase('todoMVC.db')

      setDb(electrified)
      setTodosRepository(new TodoRepository(electrified))
      setTodoListRepository(new TodoListRepository(electrified))
    }

    init();
  }, [])

  if (  db === undefined || todoRepository === undefined || todoListRepository === undefined) {
    return null
  }

  return (
    <ElectricProvider db={db}>
      <TodoMVC listId={listId} todoRepo={todoRepository} todoListRepo={todoListRepository} />
    </ElectricProvider>
  )  
}

export default function App({ listId }: { listId: string }) {
  console.log("rendering app")
  return(
    <ElectrifiedTodoMVC listId={listId}/>
  )
}

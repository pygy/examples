import React, { memo, useCallback, useEffect, useState } from 'react'
import './App.css'
import './style.css'

import { createTodo, Todo, TodoList } from './model/todo/model'
import { ElectrifiedDatabase, initElectricSqlJs } from 'electric-sql/browser'
import { ElectricProvider, useElectricQuery } from 'electric-sql/react'
import { TodoRepository } from './model/todo/repository'
import { TodoListRepository } from './model/todolist/repository'
import { v4 as uuid } from 'uuid';
import { createTodoList } from './model/todolist/model'

type Repositories = {
  todoRepo: TodoRepository,
  todoListRepo: TodoListRepository,
}

const worker = new Worker("./worker.js", { type: "module" });

function Header({ listId, repositories: { todoRepo } }: { listId: string, repositories: Repositories }) {
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
            const todo = createTodo(uuid(), listId, target.value)
            todoRepo.save(todo)
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
  todoList,
  clearCompleted,
  updateTodoList,
}: {
  remaining: number;
  todos: Todo[];
  todoList: TodoList;
  clearCompleted: () => void;
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
            onClick={() => updateTodoList({ ...todoList, filter: "all" })}
          >
            {" "}
            All{" "}
          </a>
        </li>
        <li>
          <a
            className={todoList.filter === "active" ? "selected" : ""}
            onClick={() => updateTodoList({ ...todoList, filter: "active" })}
          >
            Active
          </a>
        </li>
        <li>
          <a
            className={todoList.filter === "completed" ? "selected" : ""}
            onClick={() => updateTodoList({ ...todoList, filter: "completed" })}
          >
            Completed
          </a>
        </li>
      </ul>
      {clearCompletedButton}
    </footer>
  )
}

function TodoMVC({ listId, repositories: { todoListRepo, todoRepo } }: {
  listId: string,
  repositories: Repositories,
}) {

  const startEditing = useCallback((todo: Todo) =>
    todoListRepo.update({ id: listId, editing: todo.id }), [listId])

  const saveTodo = useCallback((todo: Todo, text: string) => {
    todoRepo.update({ ...todo, text })
    todoListRepo.update({ id: listId, editing: null })
  }, [listId])

  const deleteTodo = (todo: Todo) => todoRepo.delete(todo)

  const toggleTodo = (todo: Todo) => todoRepo.update({ ...todo, completed: !todo.completed })

  const clearCompleted = () => completed.map(c => todoRepo.delete(c))

  const toggleAll = () => {
    if (remaining === 0) {
      completed.map(c => todoRepo.update({ ...c, completed: false }))
    } else {
      active.map(c => todoRepo.update({ ...c, completed: true }))
    }
  }

  const updateTodoList = (list: TodoList): Promise<void> => todoListRepo.update(list)

  const todoListQuery = useElectricQuery("SELECT id, editing, filter FROM todolist WHERE id = ?", [listId])
  const todosQuery = useElectricQuery("SELECT * FROM todo WHERE listId = ?", [listId])
  if (!todoListQuery.results || !todosQuery.results) {
    return null
  }

  const todoList = todoListQuery.results.map(resultsToTodoList)[0]
  const { all, active, completed } = resultsToTodos(todosQuery.results)

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

  return (
    <div className="todoapp">
      <Header listId={listId} repositories={{ todoRepo, todoListRepo }} />
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

function ElectrifiedTodoMVC() {
  const [db, setDb] = useState<ElectrifiedDatabase>()
  const [repositories, setRepositories] = useState<Repositories>()
  const [todoList, setTodoList] = useState<TodoList>()

  useEffect(() => {
    const init = async () => {
      const SQL = await initElectricSqlJs(worker, { locateFile: (file: string) => `/${file}` })
      const electrified = await SQL.openDatabase('todoMVC.db')

    const todoRepo = new TodoRepository(electrified)
    const todoListRepo = new TodoListRepository(electrified)

      setDb(electrified)
      setRepositories({
        todoRepo,
        todoListRepo
      })
      
      /*
        TODO: Get todoList for user
              Check database to get already existing user?
      */
     let todoList = await todoListRepo.getById("FAKE-USER-ID")
     if(!todoList){
        todoList = createTodoList("FAKE-USER-ID", "all")
        todoListRepo.save(todoList)
      }
      setTodoList(todoList)
    }

    init();
  }, [])

  if (db === undefined || repositories === undefined || todoList === undefined) {
    return null
  }

  return (
    <ElectricProvider db={db}>
      <TodoMVC
        listId={todoList.id}
        repositories={repositories}
      />
    </ElectricProvider>
  )
}

export default function App() {
  return (
    <ElectrifiedTodoMVC/>
  )
}

const resultsToTodos = (todos: any[]) => {
  const { all, active, completed }: { all: Todo[], active: Todo[], completed: Todo[] } =
    { all: [], active: [], completed: [] }

  todos.map((t: any) => {
    const todo = createTodo(
      t.id as string,
      t.listId as string,
      t.text as string,
      t.completed == 1 ? true : false)
    all.push(todo)
    if (t.completed) {
      completed.push(todo)
    } else {
      active.push(todo)
    }
  })

  return { all, active, completed }
}

const resultsToTodoList = (r: any) => ({ id: r.id, editing: r.editing, filter: r.filter })
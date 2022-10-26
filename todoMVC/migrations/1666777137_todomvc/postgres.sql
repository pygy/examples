/*
ElectricDB Migration
{"metadata": {"title": "todoMVC", "name": "1666777137_todomvc", "sha256": "cf0a00269e7fdc53e1f5bb0c88bb7c2dbd2faee43de2050ac8ffd5483cb6cf79"}}
*/

CREATE TABLE main.todo (
  id text PRIMARY KEY,
  listId text,
  text text,
  completed integer NOT NULL DEFAULT 0);

CREATE TABLE main.todolist (
  id text PRIMARY KEY,
  filter text,
  editing integer);

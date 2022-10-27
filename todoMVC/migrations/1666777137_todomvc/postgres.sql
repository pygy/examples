/*
ElectricDB Migration
{"metadata": {"title": "todoMVC", "name": "1666777137_todomvc", "sha256": "667dcfd510936db646994998ca109aef583387d881333e79df5d9a2c34535ac3"}}
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

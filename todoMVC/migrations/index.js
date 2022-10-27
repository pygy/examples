export const data = {
  "migrations": [
    {
      "body": [
        "CREATE TABLE \"todolist\" (\n    \"id\" TEXT,\n    \"filter\" TEXT,\n    \"editing\" INTEGER,\n    PRIMARY KEY (\"id\")\n);",
        "CREATE TABLE \"todo\" (\n    \"id\" TEXT,\n    \"listId\" TEXT,\n    \"text\" TEXT,\n    \"completed\" INTEGER DEFAULT 0 NOT NULL,\n    PRIMARY KEY (\"id\")\n  );",
        "-- The ops log table\nCREATE TABLE IF NOT EXISTS _electric_oplog (\n  rowid INTEGER PRIMARY KEY AUTOINCREMENT,\n  namespace String NOT NULL,\n  tablename String NOT NULL,\n  optype String NOT NULL,\n  primaryKey String NOT NULL,\n  newRow String,\n  oldRow String,\n  timestamp TEXT\n);",
        "-- Somewhere to keep our metadata\nCREATE TABLE IF NOT EXISTS _electric_meta (\n  key TEXT,\n  value BLOB\n);",
        "-- Somewhere to track migrations\nCREATE TABLE IF NOT EXISTS _electric_migrations (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL UNIQUE,\n  sha256 TEXT NOT NULL,\n  applied_at TEXT NOT NULL\n);",
        "-- Initialisation of the metadata table\nINSERT INTO _electric_meta (key, value) VALUES ('compensations', 0), ('lastAckdRowId','0'), ('lastSentRowId', '0'), ('lsn', 'MA==');",
        "-- These are toggles for turning the triggers on and off\nDROP TABLE IF EXISTS _electric_trigger_settings;",
        "CREATE TABLE _electric_trigger_settings(tablename STRING PRIMARY KEY, flag INTEGER);",
        "INSERT INTO _electric_trigger_settings(tablename,flag) VALUES ('main.todo', 1);",
        "INSERT INTO _electric_trigger_settings(tablename,flag) VALUES ('main.todolist', 1);",
        "-- Ensures primary key is immutable\nDROP TRIGGER IF EXISTS update_ensure_main_todo_primarykey;",
        "CREATE TRIGGER update_ensure_main_todo_primarykey\n   BEFORE UPDATE ON main.todo\nBEGIN\n  SELECT\n    CASE\n      WHEN old.id != new.id THEN\n        RAISE (ABORT,'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
        "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\n\nDROP TRIGGER IF EXISTS insert_main_todo_into_oplog;",
        "CREATE TRIGGER insert_main_todo_into_oplog\n   AFTER INSERT ON main.todo\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.todo')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'todo', 'INSERT', json_object('id', new.id), json_object('id', new.id, 'listId', new.listId, 'text', new.text, 'completed', new.completed), NULL, NULL);\nEND;",
        "DROP TRIGGER IF EXISTS update_main_todo_into_oplog;",
        "CREATE TRIGGER update_main_todo_into_oplog\n   AFTER UPDATE ON main.todo\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.todo')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'todo', 'UPDATE', json_object('id', new.id), json_object('id', new.id, 'listId', new.listId, 'text', new.text, 'completed', new.completed), json_object('id', old.id, 'listId', old.listId, 'text', old.text, 'completed', old.completed), NULL);\nEND;",
        "DROP TRIGGER IF EXISTS delete_main_todo_into_oplog;",
        "CREATE TRIGGER delete_main_todo_into_oplog\n   AFTER DELETE ON main.todo\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.todo')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'todo', 'DELETE', json_object('id', old.id), NULL, json_object('id', old.id, 'listId', old.listId, 'text', old.text, 'completed', old.completed), NULL);\nEND;",
        "-- Ensures primary key is immutable\nDROP TRIGGER IF EXISTS update_ensure_main_todolist_primarykey;",
        "CREATE TRIGGER update_ensure_main_todolist_primarykey\n   BEFORE UPDATE ON main.todolist\nBEGIN\n  SELECT\n    CASE\n      WHEN old.id != new.id THEN\n        RAISE (ABORT,'cannot change the value of column id as it belongs to the primary key')\n    END;\nEND;",
        "-- Triggers that add INSERT, UPDATE, DELETE operation to the _opslog table\n\nDROP TRIGGER IF EXISTS insert_main_todolist_into_oplog;",
        "CREATE TRIGGER insert_main_todolist_into_oplog\n   AFTER INSERT ON main.todolist\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.todolist')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'todolist', 'INSERT', json_object('id', new.id), json_object('id', new.id, 'filter', new.filter, 'editing', new.editing), NULL, NULL);\nEND;",
        "DROP TRIGGER IF EXISTS update_main_todolist_into_oplog;",
        "CREATE TRIGGER update_main_todolist_into_oplog\n   AFTER UPDATE ON main.todolist\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.todolist')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'todolist', 'UPDATE', json_object('id', new.id), json_object('id', new.id, 'filter', new.filter, 'editing', new.editing), json_object('id', old.id, 'filter', old.filter, 'editing', old.editing), NULL);\nEND;",
        "DROP TRIGGER IF EXISTS delete_main_todolist_into_oplog;",
        "CREATE TRIGGER delete_main_todolist_into_oplog\n   AFTER DELETE ON main.todolist\n   WHEN 1 == (SELECT flag from _electric_trigger_settings WHERE tablename == 'main.todolist')\nBEGIN\n  INSERT INTO _electric_oplog (namespace, tablename, optype, primaryKey, newRow, oldRow, timestamp)\n  VALUES ('main', 'todolist', 'DELETE', json_object('id', old.id), NULL, json_object('id', old.id, 'filter', old.filter, 'editing', old.editing), NULL);\nEND;"
      ],
      "encoding": "escaped",
      "name": "1666777137_todomvc",
      "sha256": "667dcfd510936db646994998ca109aef583387d881333e79df5d9a2c34535ac3",
      "title": "todoMVC"
    }
  ]
}

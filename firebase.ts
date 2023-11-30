import { app } from "./config/firebaseConfig";
import { getDatabase, ref, set } from "firebase/database";
import { TodoItem } from "./type";

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

//Database reference of todos collection
export const todosRef = ref(db, "todos/");

export const addTodoFirebase = (newTodo: TodoItem) => {
  const db = getDatabase();
  set(ref(db, "todos/" + newTodo.id), newTodo);
};
export const updateTodoFirebase = (updateTodo: TodoItem) => {
  set(ref(db, "todos/" + updateTodo.id), updateTodo);
};
export const deleteTodoFirebase = (id: string) => {
  const db = getDatabase();
  set(ref(db, "todos/" + id), null);
};

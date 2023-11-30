"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  useRef,
} from "react";
import { onValue, off } from "firebase/database";
import { addTodoFirebase, deleteTodoFirebase, todosRef, updateTodoFirebase } from "@/firebase";
import { TodoItem } from "@/type";



const List = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [editedTodoId, setEditedTodoId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [hoveredTodos, setHoveredTodos] = useState<Record<string, boolean>>({});

  //Use to set focus on input when Edit
  const inputRef = useRef<HTMLInputElement>(null);

  //Fetch from API
  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const response = await fetch('/api/todos');
  //         const data = await response.json(); 
  //         setTodos(data); 
  //       } catch (error) {
  //         console.error('Error fetching todos:', error);
  //       }
  //     };

  //     fetchData();
  //   }, []);

  //Fetch data and Render
  useEffect(() => {
    // Listen for changes in the 'todos' collection
    onValue(todosRef, (snapshot) => {
      const data = snapshot.val() || {};
      const todoList = Object.entries(data).map(([id, todo]: any) => ({
        id,
        ...todo,
      }));
      setTodos(todoList);
    });

    // Cleanup listener on component unmount
    return () => {
      off(todosRef);
    };
  }, []);

  //On change input filter todo list
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTodo(value);
    setFilterText(value);
  };
  //User enter key "Enter" to add/edit
  const handleEnterKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (editedTodoId) {
        editTodo();
      } else {
        addTodo();
      }
    }
  };

  //Add new
  const addTodo = () => {
    if (newTodo.trim() === "") {
      alert("Cannot add a empty item.");
      return;
    }

    const isDuplicate = todos.some(
      (todo) => todo.todo.toLowerCase() === newTodo.toLowerCase()
    );

    if (isDuplicate) {
      alert("Cannot add a duplicate item.");
      return;
    }

    const newTodoItem: TodoItem = {
      id: Date.now().toString(),
      todo: newTodo,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([...todos, newTodoItem]);
    addTodoFirebase(newTodoItem);
    setNewTodo("");
    setFilterText("");
  };
  //Remove
  const removeTodo = (id: string) => {
    deleteTodoFirebase(id);
  };

  //Edit and set focus
  const editTodoItem = (todo: TodoItem) => {
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
    setNewTodo(todo.todo);
    setEditedTodoId(todo.id);
  };

  const editTodo = () => {
    if (editedTodoId) {
      const editedTodoIndex = todos.findIndex(
        (todo) => todo.id === editedTodoId
      );

      if (editedTodoIndex !== -1) {
        todos[editedTodoIndex].todo = newTodo;
        updateTodoFirebase(todos[editedTodoIndex]);
      }

      setEditedTodoId(null);
      setNewTodo("");
      setFilterText("");
    }
  };
  //Mark as complete
  const markAsComplete = (id: string) => {
    const editedTodoIndex = todos.findIndex((todo) => todo.id === id);

    if (editedTodoIndex !== -1) {
      const updatedTodos = [...todos];
      updatedTodos[editedTodoIndex] = {
        ...updatedTodos[editedTodoIndex],
        isCompleted: !updatedTodos[editedTodoIndex].isCompleted,
      };
      updateTodoFirebase(updatedTodos[editedTodoIndex]);

      setTodos(updatedTodos);
    }
  };

  //5. Filter Todo list
  const filteredTodos = todos.filter((todo) =>
    todo.todo.toLowerCase().includes(filterText.toLowerCase())
  );
  const isDisplayNoResultMsg = () => {
    return (
      filteredTodos.length === 0 && filterText !== "" && editedTodoId === null
    );
  };

  return (
    <>
      <input
        className="text-black mb-4"
        ref={inputRef}
        type="text"
        value={newTodo}
        onChange={handleInputChange}
        onKeyDown={handleEnterKey}
        placeholder="Add a new todo..."
      />
      {isDisplayNoResultMsg() && <p>No result. Create a new one instead!</p>}
      {filteredTodos.map((todo) => {
        const isHovered = hoveredTodos[todo.id];
        const isEditing = editedTodoId === todo.id;
        return (
          <div
            key={todo.id}
            onMouseEnter={() =>
              setHoveredTodos((prevState) => ({
                ...prevState,
                [todo.id]: true,
              }))
            }
            onMouseLeave={() =>
              setHoveredTodos((prevState) => ({
                ...prevState,
                [todo.id]: false,
              }))
            }
            className="flex flex-row gap-2"
          >
            <h4
              style={{
                textDecoration: todo.isCompleted ? "line-through" : "none",
              }}
            >
              {todo.todo}
            </h4>
            {isEditing ? (
              <p>Editing...</p>
            ) : (
              isHovered && (
                <>
                  <button onClick={() => removeTodo(todo.id)}>
                    {" "}
                    - Remove |{" "}
                  </button>
                  <button onClick={() => editTodoItem(todo)}>Edit | </button>
                  <button onClick={() => markAsComplete(todo.id)}>
                    {todo.isCompleted
                      ? "Mark as Incomplete"
                      : "Mark as Complete"}
                  </button>
                </>
              )
            )}
          </div>
        );
      })}
    </>
  );
};

export default List;

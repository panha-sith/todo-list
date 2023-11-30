import { TodoItem } from "@/type";

const todos: TodoItem[] = [
  {
    id: "1",
    todo: "First todo",
    isCompleted: false,
    createdAt: "2022-01-01T00:00:00Z"
  },
  {
    id: "2",
    todo: "Second todo",
    isCompleted: true,
    createdAt: "2022-01-02T00:00:00Z"
  }
];

export const GET = async (request: Request) => {
  return new Response(JSON.stringify(todos), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST = async (request: Request) => {
  const { todo } = await request.json();
  const newTodoItem: TodoItem = {
    id: Date.now().toString(), 
    todo,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodoItem);

  return new Response(JSON.stringify(newTodoItem), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT = async (request: Request) => {
  const { id, todo, isCompleted } = await request.json();

  const index = todos.findIndex((item) => item.id === id);

  if (index !== -1) {
    todos[index] = {
      ...todos[index],
      todo: todo ? todo : todos[index].todo,
      isCompleted: isCompleted !== undefined ? isCompleted : todos[index].isCompleted,
    };

    return new Response(JSON.stringify(todos[index]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Todo not found.', { status: 404 });
};

export const DELETE = async (request: Request) => {
  const { id } = await request.json();

  const index = todos.findIndex((item) => item.id === id);

  if (index !== -1) {
    const deletedItem = todos.splice(index, 1)[0];

    return new Response(JSON.stringify(deletedItem), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Todo not found.', { status: 404 });
};

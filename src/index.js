const express = require('express');
const app = express();
app.use(express.json());
const { v4: uuidv4 } = require("uuid");

const users = [];

// Middleware

function checkExistsUserAccount (request, response, next){
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

    if(!user) {
      return response.status(404).json({ error: "Mensagem do erro"})
    }

  request.user = user;
  return next();
}
function checkTodoExists  (request, response, next){
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Mensagem do erro' });
  }

  request.todo = todo;

  return next();
};
app.post("/users", (request, response) => {
const {name, username} = request.body;

const UserAlreadyExists = users.some(
    (user) => user.username === username
  );

  if(UserAlreadyExists) {
    return response.status(400).json({error: 'Mensagem do erro'});
  }
      users.push({
        id: uuidv4(),
        name,
        username,
        todos: []
      });

  return response.status(201).json(users);
});
app.get("/todos",checkExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos);
   
});
app.post("/todos",checkExistsUserAccount,(request, response) => {
  const {title, deadline } = request.body;
  const {user} = request;

  const todosOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todosOperation);

  return response.status(201).send();
});
app.put("/todos/:id",checkExistsUserAccount,checkTodoExists,(request, response) => {
  const {todo} = request;
  const {title, deadline} = request.body;

  todo.title = title;
  todo.deadline = deadline;
  
  return response.json(todo);
  
});
app.patch("/todos/:id/done",checkExistsUserAccount,checkTodoExists, (request, response) => {
  const {todo} = request;

  todo.done = true;

  return response.json(todo);
})
app.delete("/todos/:id", checkExistsUserAccount, checkTodoExists, (request, response) => {
  const {user,todo} = request;

  user.todos.splice(todo.id, 1);

  return response.status(204).json(user.todos);
});
app.listen(4444); 
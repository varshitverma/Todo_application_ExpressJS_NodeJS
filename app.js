const express = require("express");
const app = express();
app.use(express.json());

const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Started.... :<)");
    });
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
};
initializeDBServer();

//API-1
//GET

const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const convertObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    //SCENARIO-7
    //Returns a list of all todos whose category is 'LEARNING' and priority is 'HIGH'
    case hasCategoryAndPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
                SELECT * 
                    FROM todo 
                WHERE 
                    category='${category}' and priority='${priority}';`;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => convertObject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    //SCENARIO-5
    //Returns a list of all todos whose category is 'WORK' and status is 'DONE'
    case hasCategoryAndStatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                SELECT *
                        FROM todo
                    WHERE 
                        category='${category}' and status='${status}';`;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => convertObject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    //SCENARIO-4
    //Returns a list of all todos whose todo contains 'Buy' text
    case hasSearchProperty(request.query):
      getTodosQuery = `
                SELECT *
                    FROM todo
                WHERE todo like '%${search_q}%';`;
      data = await db.all(getTodosQuery);
      response.send(data.map((eachItem) => convertObject(eachItem)));

      break;

    //SCENARIO-3
    //Returns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'
    case hasPriorityAndStatusProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                SELECT *
                    FROM todo  
                WHERE
                 status = '${status}' AND priority = '${priority}';`;
          data = await db.all(getTodosQuery);
          response.send(data.map((eachItem) => convertObject(eachItem)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;

    //SCENARIO-2
    //Returns a list of all todos whose priority is 'HIGH'
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
        SELECT *
            FROM todo 
        WHERE 
            priority = '${priority}';`;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => convertObject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //SCENARIO-1
    //Returns a list of all todos whose status is 'TO DO'
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
        SELECT *
            FROM todo 
        WHERE 
            status = '${status}';`;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => convertObject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //SCENARIO-6
    //Returns a list of all todos whose category is 'HOME'
    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
            SELECT *
                FROM todo
            WHERE 
                category='${category}';`;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => convertObject(eachItem)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    //DEFAULT
    default:
      getTodosQuery = `
      SELECT * 
        FROM todo;`;
      data = await db.all(getTodosQuery);
      response.send(data.map((eachItem) => convertObject(eachItem)));
  }
});

//API-2
//Returns a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT *
        FROM todo
    WHERE id=${todoId};`;
  const getTodoResponse = await db.get(getTodoQuery);
  response.send(convertObject(getTodoResponse));
});

//API-3
//Returns a list of all todos with a specific
// due date in the query parameter /agenda/?date=2021-12-12

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const dateQuery = `
        SELECT *
            FROM todo
        WHERE due_date='${newDate}';`;
    const dateResponse = await db.all(dateQuery);
    response.send(dateResponse.map((eachItem) => convertObject(eachItem)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API-4
//Create a todo in the todo table

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    if (status === "TO DO" || priority === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const postTodoQuery = `
                INSERT INTO
                    todo (id, todo, category, priority, status, due_date)
                VALUES
                    (${id}, '${todo}', '${category}', '${priority}', '${status}', '${postDueDate}') `;
          await db.run(postTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API-5
//Updates the details of a specific todo based on the todo ID

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  const previousTodoQuery = `
    SELECT *
        FROM todo
    WHERE id=${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  let updateTodoQuery = null;
  switch (true) {
    //SCENARIO-1
    //UPDATE STATUS OF TODO
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
                UPDATE todo SET
                    todo='${todo}', priority='${priority}', status='${status}', category='${category}',
                    due_date='${dueDate}'
                WHERE id=${todoId};`;

        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    //SCENARIO-2
    //UPDATE PRIORITY OF TODO
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        updateTodoQuery = `
        UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
        due_date='${dueDate}' WHERE id = ${todoId};`;

        await db.run(updateTodoQuery);
        response.send(`Priority Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //SCENARIO-3
    //UPDATE TODO
    case requestBody.todo !== undefined:
      updateTodoQuery = `
          UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',due_date='${dueDate}'
          WHERE id=${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;

    //SCENARIO-4
    //UPDATE CATEGORY OF TODO

    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `
          UPDATE todo SET
                    todo='${todo}', priority='${priority}', status='${status}', category='${category}',
                    due_date='${dueDate}' WHERE id=${todoId};`;

        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    //SCENARIO-5
    //UPDATE DUE DATE

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `
        UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
        due_date='${newDueDate}'
        WHERE
            id=${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }

      break;
  }
});

//API-6
//Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
        todo
    WHERE
        id = ${todoId}`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

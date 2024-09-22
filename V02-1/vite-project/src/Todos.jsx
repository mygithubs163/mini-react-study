import React from "../core/React";

function Todos() {
  // const todos = [
  //   {title: '吃饭'},
  //   {title: '喝水'},
  //   {title: '写代码'},
  //   {title: '睡觉'},
  // ]

  // const [todos, setTodos] = React.useState([
  //     {
  //       title: '吃饭',
  //       id: crypto.randomUUID(),
  //       status: 'active',
  //     },
  //     {
  //       title: '喝水',
  //       id: crypto.randomUUID(),
  //       status: 'done',
  //     },
  //     {
  //       title: '写代码',
  //       id: crypto.randomUUID(),
  //       status: 'done',
  //     },
  //     {
  //       title: '睡觉',
  //       id: crypto.randomUUID(),
  //       status: 'done',
  //     },
  // ]);
  const [todos, setTodos] = React.useState([]);
  const [inputVal, setInputVal] = React.useState('');
  const [displayTodos, setDisplayTodos] = React.useState([]);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    const rawTodos = localStorage.getItem('todos');
    if (rawTodos) {
      setTodos(JSON.parse(rawTodos));
    }
  }, []);

  // create todo
  function createTodo(title) {
    return {
      title,
      id: crypto.randomUUID(),
      status: 'active',
    }
  }

  //add todo
  function addTodo(title) {
    setTodos(todos => [...todos, createTodo(title)]);
  }

  //add button
  function handleAdd() {
    if (inputVal.trim()) {
      addTodo(inputVal);
    }
    setInputVal('');
  }

  //remove todo
  function removeTodo(id) {
    const newTodos = todos.filter(todo => todo.id !== id);
    setTodos(newTodos);
  }

  // done todo
  function doneTodo(id) {
    const newTodos = todos.map(todo => {
      if (todo.id === id) {
        todo.status = 'done';
      }
      return todo;
    });
    setTodos(newTodos);
  }

  // cancel todo
  function cancelTodo(id) {
    const newTodos = todos.map(todo => {
      if (todo.id === id) {
        todo.status = 'active';
      }
      return todo;
    });
    setTodos(newTodos);
  }

  // save 功能
  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // 切换过滤器
  React.useEffect(() => {
    if (filter === 'all') {
      setDisplayTodos(todos);
    } else {
      const newTodos = todos.filter(todo => todo.status === filter);
      setDisplayTodos(newTodos);
    }
    console.log('filter, todos', displayTodos, filter, todos)
  }, [filter, todos]);

  return (
    <div>
      <h1>TODOS</h1>
      {/* <div>
        <input type="text" />
        <button>Add</button>
      </div>
      <ul>
        {...todos.map(todo => {
          return <li>{todo.title}</li>
        })}
      </ul> */}
      <div>
        <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} />
        <button onClick={handleAdd}>Add</button>
        <button onClick={saveTodos}>Save</button>
      </div>
      <div>
        <input type="radio" name="filter" id="all" checked={filter === 'all'} onChange={() => setFilter('all')}/>
        <label htmlFor="all">all</label>
        <input type="radio" name="filter" id="active" checked={filter === 'active'} onChange={() => setFilter('active')}/>
        <label htmlFor="active">active</label>
        <input type="radio" name="filter" id="done" checked={filter === 'done'} onChange={() => setFilter('done')}/>
        <label htmlFor="done">done</label>
      </div>
      <ul>
        {...displayTodos.map(todo => {
          return <TodoItem todo={todo} removeTodo={removeTodo} cancelTodo={cancelTodo} doneTodo={doneTodo} />
        })}
      </ul>
    </div>
  );
}

function TodoItem({ todo, removeTodo, cancelTodo, doneTodo }) {
  return (
    <li className={todo.status}>
      <span>{todo.title}</span>
      <button  onClick={() => removeTodo(todo.id)}>Remove</button>
      <button onClick={() => cancelTodo(todo.id)}>Cancel</button>
      <button onClick={() => doneTodo(todo.id)}>Done</button>
    </li>
  );
}

export default Todos;
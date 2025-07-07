import { useState, useEffect, useRef } from 'react'

function getInitialTodos() {
  const saved = localStorage.getItem('todos')
  return saved ? JSON.parse(saved) : []
}

function showAllTodos() {
  return true
}

function showActiveTodos(todo) {
  return !todo.completed
}

function showCompletedTodos(todo) {
  return todo.completed
}

const FILTERS = {
  all: showAllTodos,
  active: showActiveTodos,
  completed: showCompletedTodos,
}

function App() {
  const [todos, setTodos] = useState(getInitialTodos)
  const [filter, setFilter] = useState('all')
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const dragItem = useRef()
  const dragOverItem = useRef()
  const inputRef = useRef()

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function addTodo(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setTodos(todos => [
      ...todos,
      { id: Date.now(), text, completed: false }
    ])
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function toggleTodo(id) {
    setTodos(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  function deleteTodo(id) {
    setTodos(todos => todos.filter(todo => todo.id !== id))
  }

  function startEdit(id, text) {
    setEditingId(id)
    setEditingText(text)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function saveEdit(id) {
    setTodos(todos =>
      todos.map(todo =>
        todo.id === id ? { ...todo, text: editingText.trim() || todo.text } : todo
      )
    )
    setEditingId(null)
    setEditingText('')
  }

  function clearCompleted() {
    setTodos(todos => todos.filter(todo => !todo.completed))
  }

  function handleDragStart(idx) {
    dragItem.current = idx
  }

  function handleDragEnter(idx) {
    dragOverItem.current = idx
  }

  function handleDragEnd() {
    if (
      dragItem.current === null ||
      dragOverItem.current === null ||
      dragItem.current === dragOverItem.current
    ) {
      dragItem.current = null
      dragOverItem.current = null
      return
    }
    const list = [...todos]
    const dragged = list.splice(dragItem.current, 1)[0]
    list.splice(dragOverItem.current, 0, dragged)
    setTodos(list)
    dragItem.current = null
    dragOverItem.current = null
  }

  const filteredTodos = todos.filter(FILTERS[filter])
  const activeCount = todos.filter(todo => !todo.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-100 flex flex-col items-center py-10 px-0">
      <div className="bg-white/90 shadow-2xl rounded-3xl w-full sm:max-w-2xl p-2 sm:p-10 border border-purple-100 transition-all duration-300">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-400 drop-shadow-lg tracking-tight">
          To-Do List
        </h1>
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200/50 text-lg transition placeholder-gray-400 bg-white/80"
            placeholder="What needs to be done?"
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="Add todo"
            maxLength={100}
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-400 text-white px-6 py-3 rounded-xl font-semibold shadow hover:from-purple-600 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition disabled:opacity-50"
            disabled={!input.trim()}
          >
            Add
          </button>
        </form>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="flex gap-2">
            {Object.keys(FILTERS).map(f => (
              <button
                key={f}
                className={`px-3 py-1.5 rounded-lg font-medium transition text-sm ${
                  filter === f
                    ? 'bg-gradient-to-r from-purple-500 to-pink-400 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                }`}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={clearCompleted}
            className="text-xs text-red-500 hover:underline focus:underline transition disabled:opacity-40"
            disabled={todos.every(todo => !todo.completed)}
          >
            Clear Completed
          </button>
        </div>
        <ul className="divide-y divide-purple-100">
          {filteredTodos.length === 0 && (
            <li className="text-gray-400 text-center py-8 text-lg select-none">No todos</li>
          )}
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center gap-2 py-3 group transition-all duration-200 bg-white/70 rounded-xl mb-2 shadow-sm hover:shadow-lg ${
                dragItem.current === todos.indexOf(todo) ? 'ring-2 ring-purple-300 scale-[1.01]' : ''
              }`}
              draggable
              onDragStart={() => handleDragStart(todos.indexOf(todo))}
              onDragEnter={() => handleDragEnter(todos.indexOf(todo))}
              onDragEnd={handleDragEnd}
              tabIndex={0}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="accent-purple-500 w-5 h-5 cursor-pointer"
                aria-label={`Mark ${todo.text} as completed`}
              />
              {editingId === todo.id ? (
                <input
                  ref={inputRef}
                  className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-base"
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(todo.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  maxLength={100}
                  autoFocus
                />
              ) : (
                <span
                  className={`flex-1 break-words text-base ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                  } cursor-pointer select-text`}
                  onDoubleClick={() => startEdit(todo.id, todo.text)}
                  title="Double-click to edit"
                >
                  {todo.text}
                </span>
              )}
              <button
                onClick={() => startEdit(todo.id, todo.text)}
                className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-purple-100 text-purple-500 font-medium transition focus:outline-none focus:ring-2 focus:ring-purple-200
                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Edit"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-xs px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-100 text-red-500 font-medium transition focus:outline-none focus:ring-2 focus:ring-red-200
                  opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Delete"
              >
                Delete
              </button>
              <span
                className="cursor-move text-purple-300 ml-2 text-xl select-none hidden sm:inline"
                title="Drag to reorder"
                aria-label="Drag handle"
              >
                &#x2630;
              </span>
              <span
                className="cursor-move text-purple-300 ml-2 text-xl select-none sm:hidden"
                title="Drag to reorder"
                aria-label="Drag handle"
              >
                &#x2630;
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-base text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            <span className="font-semibold text-purple-500">{activeCount}</span> item{activeCount !== 1 ? 's' : ''} left
          </span>
          <span className="italic text-sm text-purple-400">Drag to reorder</span>
        </div>
      </div>
    </div>
  )
}

export default App

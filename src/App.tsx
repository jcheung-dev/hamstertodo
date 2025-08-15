import React from 'react'
import Header from './components/Header/Header'
import { TodoProvider } from './context/TodoContext'
import AddTodoForm from './components/AddTodoForm/AddTodoForm'
import TodoList from './components/TodoList/TodoList'
import Completed from './components/Completed/Completed'

export default function App(){
  return (
    <div className="app-root">
      <TodoProvider>
        <Header />
        <main>
          <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <AddTodoForm />
            </div>
          </div>

          <div style={{marginTop:20}}>
            <TodoList />
            <Completed />
          </div>
        </main>
      </TodoProvider>
    </div>
  )
}

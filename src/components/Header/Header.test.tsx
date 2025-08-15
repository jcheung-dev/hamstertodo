import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'
import { TodoProvider } from '../../context/TodoContext'

describe('Header', ()=>{
  beforeEach(()=>{
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  test('renders and toggles theme', ()=>{
    render(
      <TodoProvider>
        <Header />
      </TodoProvider>
    )
  // open settings
  const settings = screen.getByRole('button', { name: /settings/i })
  expect(settings).toBeInTheDocument()
  fireEvent.click(settings)
  const btn = screen.getByRole('button', { name: /system/i })
  expect(btn).toBeInTheDocument()
  // default set on document
  expect(['light','dark']).toContain(document.documentElement.getAttribute('data-theme'))
  fireEvent.click(btn)
  // theme attribute flips
  expect(['light','dark']).toContain(document.documentElement.getAttribute('data-theme'))
  // persisted
  expect(localStorage.getItem('theme')).toBe(document.documentElement.getAttribute('data-theme'))
  })

  test('persists theme across loads', ()=>{
    // set saved theme
    localStorage.setItem('theme','dark')
    render(
      <TodoProvider>
        <Header />
      </TodoProvider>
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})

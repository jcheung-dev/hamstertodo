import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', ()=>{
  beforeEach(()=>{
    localStorage.clear()
  })

  test('initializes with default', ()=>{
    const { result } = renderHook(()=> useLocalStorage('x', 5))
    expect(result.current[0]).toBe(5)
  })

  test('persists to localStorage', ()=>{
    const { result } = renderHook(()=> useLocalStorage('k', {a:1}))
    act(()=> result.current[1]({a:2}))
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual({a:2})
  })

  test('reads existing localStorage', ()=>{
    localStorage.setItem('z', JSON.stringify('hello'))
    const { result } = renderHook(()=> useLocalStorage('z', 'no'))
    expect(result.current[0]).toBe('hello')
  })
})

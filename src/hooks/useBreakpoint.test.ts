import { getBreakpoint, useBreakpoint } from './useBreakpoint'
import { renderHook, act, waitFor } from '@testing-library/react'

describe('breakpoints', ()=>{
  test('getBreakpoint works', ()=>{
    expect(getBreakpoint(320)).toBe('phone')
    expect(getBreakpoint(700)).toBe('tablet')
    expect(getBreakpoint(1200)).toBe('desktop')
  })

  test('useBreakpoint responds to resize', async ()=>{
    // set initial width
    // @ts-ignore
    global.innerWidth = 500
    const { result } = renderHook(()=> useBreakpoint())
    expect(result.current).toBe('phone')
    // change inside act and wait for update
    act(()=>{
      // @ts-ignore
      global.innerWidth = 1100
      window.dispatchEvent(new Event('resize'))
    })
    await waitFor(()=>{
      if(result.current !== 'desktop') throw new Error('not yet')
    })
    expect(result.current).toBe('desktop')
  })
})

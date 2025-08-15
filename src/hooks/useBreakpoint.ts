import { useEffect, useState } from 'react'

export type Breakpoint = 'phone'|'tablet'|'desktop'

export function getBreakpoint(width: number): Breakpoint{
  if(width < 640) return 'phone'
  if(width < 1024) return 'tablet'
  return 'desktop'
}

export function useBreakpoint(){
  const [bp, setBp] = useState<Breakpoint>(()=> getBreakpoint(typeof window !== 'undefined' ? window.innerWidth : 1024))
  useEffect(()=>{
    function onResize(){ setBp(getBreakpoint(window.innerWidth)) }
    window.addEventListener('resize', onResize)
    return ()=> window.removeEventListener('resize', onResize)
  },[])
  return bp
}

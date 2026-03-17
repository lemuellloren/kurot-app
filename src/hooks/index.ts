import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export function useGreeting(name?: string): string {
  const h = new Date().getHours()
  const timeOfDay = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  return name ? `${timeOfDay}, ${name}!` : `${timeOfDay}!`
}

export function useClock(): string {
  const [time, setTime] = useState('')
  useEffect(() => {
    const fmt = () => {
      const n = new Date()
      setTime(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`)
    }
    fmt()
    const t = setInterval(fmt, 30000)
    return () => clearInterval(t)
  }, [])
  return time
}

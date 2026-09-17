import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  placeholder?: string
  /** Called with the (debounced) query whenever it changes. */
  onSearch: (query: string) => void
  /** Debounce delay in ms (default 300). */
  delay?: number
  defaultValue?: string
  autoFocus?: boolean
}

/**
 * Text input with a search icon that debounces the caller's onSearch handler
 * so we don't fire a request on every keystroke.
 */
export function SearchBar({
  placeholder = 'Search…',
  onSearch,
  delay = 300,
  defaultValue = '',
  autoFocus = false,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)

  // Keep the latest onSearch in a ref so the debounce effect doesn't need it
  // as a dependency (which would reset the timer whenever the parent re-renders).
  const onSearchRef = useRef(onSearch)
  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    const timer = setTimeout(() => onSearchRef.current(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}

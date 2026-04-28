import { ChevronDown } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

interface DropdownProps {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  allLabel?: string
}

export function FilterDropdown({ label, value, options, onChange, allLabel = 'All' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)
  const isFiltered = value !== ''

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`filter-dropdown${isFiltered ? ' is-active' : ''}`} ref={ref}>
      <button
        type="button"
        className="filter-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{isFiltered ? selected?.label ?? label : label}</span>
        <ChevronDown size={13} className={`filter-chevron${open ? ' open' : ''}`} />
      </button>
      {open && (
        <div className="filter-dropdown-menu">
          <button
            type="button"
            className={`filter-dropdown-option${value === '' ? ' selected' : ''}`}
            onClick={() => { onChange(''); setOpen(false) }}
          >
            {allLabel}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`filter-dropdown-option${value === opt.value ? ' selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

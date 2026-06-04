import { useState, useRef, useEffect, useId } from 'react'
import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  id?: string
  className?: string
}

export function Select({ label, error, options, placeholder, disabled, value, onChange, id, className = '' }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const autoId = useId()
  const selectId = id ?? autoId

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleOpen = () => {
    if (disabled) return
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const gap = 2
      const maxHeight = 200
      const spaceBelow = window.innerHeight - rect.bottom - gap
      const spaceAbove = rect.top - gap

      if (spaceBelow >= 80 || spaceBelow >= spaceAbove) {
        setDropdownStyle({
          top: rect.bottom + gap,
          left: rect.left,
          width: rect.width,
          maxHeight: Math.min(maxHeight, Math.max(spaceBelow, 80)),
        })
      } else {
        setDropdownStyle({
          bottom: window.innerHeight - rect.top + gap,
          left: rect.left,
          width: rect.width,
          maxHeight: Math.min(maxHeight, spaceAbove),
        })
      }
    }
    setOpen(o => !o)
  }

  const handleSelect = (optionValue: string) => {
    const syntheticEvent = { target: { value: optionValue } } as React.ChangeEvent<HTMLSelectElement>
    onChange?.(syntheticEvent)
    setOpen(false)
  }

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        id={selectId}
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={[
          'flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm shadow-sm text-left',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          error ? 'border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white cursor-pointer',
          className,
        ].join(' ')}
      >
        <span className={selected ? 'text-gray-900 flex-1 min-w-0 truncate' : 'text-gray-400 flex-1 min-w-0 truncate'}>
          {selected ? selected.label : (placeholder ?? '')}
        </span>
        <svg className="h-4 w-4 text-gray-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          style={{ position: 'fixed', zIndex: 9999, overflowY: 'auto', ...dropdownStyle }}
          className="bg-white border border-gray-300 rounded-md shadow-md"
        >
          {placeholder && (
            <li
              onMouseDown={e => { e.preventDefault(); handleSelect('') }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!value ? 'text-gray-500' : 'text-gray-400'}`}
            >
              {placeholder}
            </li>
          )}
          {options.map(opt => (
            <li
              key={opt.value}
              onMouseDown={e => { e.preventDefault(); handleSelect(opt.value) }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${value === opt.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-900'}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

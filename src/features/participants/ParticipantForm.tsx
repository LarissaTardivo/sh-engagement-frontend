import { useState, useRef, useEffect, useCallback } from 'react'
import { Select } from '../../shared/components/Select'
import { Button } from '../../shared/components/Button'
import { useCreateParticipant, useUpdateParticipant } from './useParticipants'
import { useCellsWithParticipants, usePrayerGroupsWithParticipants } from '../groups/useGroups'
import type { CommunityType, Participant } from '../../shared/lib/api'

interface ParticipantFormProps {
  teamId: string
  onSuccess: () => void
  participant?: Participant
}

const communityOptions = [
  { value: 'OBRA', label: 'Obra' },
  { value: 'COMUNIDADE_VIDA', label: 'CV' },
  { value: 'COMUNIDADE_ALIANCA', label: 'CAL' },
]

interface NameOption {
  name: string
  teamNames: string[]
  communityType: CommunityType
  groups: string[]
}

const communityLabel: Record<CommunityType, string> = {
  OBRA: 'Obra',
  COMUNIDADE_VIDA: 'CV',
  COMUNIDADE_ALIANCA: 'CAL',
}

const communityBadge: Record<CommunityType, string> = {
  OBRA: 'bg-indigo-300 text-indigo-700',
  COMUNIDADE_VIDA: 'bg-emerald-300 text-emerald-700',
  COMUNIDADE_ALIANCA: 'bg-amber-300 text-amber-700',
}

function NameSelect({
  options,
  value,
  onChange,
  disabled,
  placeholder,
  error,
}: {
  options: NameOption[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const computeStyle = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const gap = 2
    const maxDropdownHeight = 240
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const spaceAbove = rect.top - gap
    if (spaceBelow >= 80 || spaceBelow >= spaceAbove) {
      setDropdownStyle({ top: rect.bottom + gap, left: rect.left, width: rect.width, maxHeight: Math.min(maxDropdownHeight, Math.max(spaceBelow, 80)) })
    } else {
      setDropdownStyle({ bottom: window.innerHeight - rect.top + gap, left: rect.left, width: rect.width, maxHeight: Math.min(maxDropdownHeight, spaceAbove) })
    }
  }, [])

  const handleOpen = () => {
    if (disabled) return
    computeStyle()
    setOpen(o => {
      if (!o) setTimeout(() => searchRef.current?.focus(), 0)
      else setQuery('')
      return !o
    })
  }

  const filtered = query
    ? options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
    : options

  const selected = options.find(o => o.name === value)

  return (
    <div ref={ref} className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={[
          'flex items-center justify-between w-full rounded-md border px-3 py-2 text-sm shadow-sm text-left',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          error ? 'border-red-400' : 'border-gray-300',
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white cursor-pointer',
        ].join(' ')}
      >
        <span className="flex-1 min-w-0">
          {selected ? (
            <span className="flex flex-col">
              <span className="text-gray-900">{selected.name}</span>
              {selected.teamNames.length > 0 && (
                <span className="text-xs font-medium text-emerald-600">
                  Engajado(a): {selected.teamNames.join(' | ')}
                </span>
              )}
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <svg className="h-4 w-4 text-gray-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          style={{ position: 'fixed', zIndex: 9999, display: 'flex', flexDirection: 'column', ...dropdownStyle }}
          className="bg-white border border-gray-300 rounded-md shadow-md"
        >
          <div className="px-2 py-1.5 border-b border-gray-100 shrink-0">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={e => e.key === 'Escape' && (setOpen(false), setQuery(''))}
            />
          </div>
          <ul className="overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-gray-400 text-center">Nenhum resultado</li>
            ) : filtered.map(opt => (
              <li
                key={opt.name}
                onMouseDown={e => {
                  e.preventDefault()
                  onChange(opt.name)
                  setOpen(false)
                  setQuery('')
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 ${value === opt.name ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-900 truncate">{opt.name}</span>
                  <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${communityBadge[opt.communityType]}`}>
                    {communityLabel[opt.communityType]}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 truncate">{opt.groups.join(' | ')}</span>
                  {opt.teamNames.length > 0 && (
                    <span className="text-xs font-medium text-emerald-600">
                      Engajado(a): {opt.teamNames.join(' | ')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function ParticipantForm({ teamId, onSuccess, participant }: ParticipantFormProps) {
  const [communityType, setCommunityType] = useState<CommunityType | ''>(participant?.communityType ?? '')
  const [prayerGroup, setPrayerGroup] = useState(participant?.prayerGroup ?? '')
  const [cell, setCell] = useState(participant?.cell ?? '')
  const [name, setName] = useState(participant?.name ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: cellsWithP = [] } = useCellsWithParticipants()
  const { data: prayerGroupsWithP = [] } = usePrayerGroupsWithParticipants()

  const createParticipant = useCreateParticipant()
  const updateParticipant = useUpdateParticipant()
  const isPending = createParticipant.isPending || updateParticipant.isPending
  const isEditing = !!participant

  const isObra = communityType === 'OBRA'
  const isCommunity = communityType === 'COMUNIDADE_VIDA' || communityType === 'COMUNIDADE_ALIANCA'

  const cellOptions = cellsWithP.map(c => ({ value: c.name, label: c.category ? `${c.name} — ${c.category}` : c.name }))
  const prayerGroupOptions = prayerGroupsWithP.map(g => ({ value: g.name, label: g.category ? `${g.name} — ${g.category}` : g.name }))

  const allFromCells = cellsWithP.flatMap(c => c.participants.map(p => ({ ...p, groupName: c.name })))
  const allFromGroups = prayerGroupsWithP.flatMap(g => g.participants.map(p => ({ ...p, groupName: g.name })))

  const participantSources =
    isObra && prayerGroup ? allFromGroups.filter(p => p.groupName === prayerGroup)
    : isCommunity && cell ? allFromCells.filter(p => p.groupName === cell)
    : communityType === 'OBRA' ? allFromGroups
    : communityType ? allFromCells
    : [...allFromCells, ...allFromGroups]

  const groupedMap = new Map<string, { teamNames: string[]; communityType: CommunityType; groups: Set<string> }>()
  for (const p of participantSources) {
    const entry = groupedMap.get(p.name) ?? { teamNames: [], communityType: p.communityType, groups: new Set<string>() }
    if (p.team && !entry.teamNames.includes(p.team.name)) entry.teamNames.push(p.team.name)
    entry.groups.add(p.groupName)
    groupedMap.set(p.name, entry)
  }
  const nameOptions: NameOption[] = Array.from(groupedMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([n, { teamNames, communityType: ct, groups }]) => ({ name: n, teamNames, communityType: ct, groups: Array.from(groups) }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'O nome é obrigatório.'
    if (!communityType) errs.communityType = 'Selecione o nível de engajamento.'
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    const payload = {
      name: name.trim(),
      communityType: communityType as CommunityType,
      prayerGroup: isObra ? prayerGroup.trim() : undefined,
      cell: isCommunity ? cell.trim() : undefined,
    }

    if (isEditing) {
      updateParticipant.mutate(
        { id: participant.id, teamId, payload },
        {
          onSuccess: () => onSuccess(),
          onError: () => setServerError('Erro ao salvar membro. Tente novamente.'),
        }
      )
    } else {
      createParticipant.mutate(
        { teamId, payload },
        {
          onSuccess: () => onSuccess(),
          onError: () => setServerError('Erro ao adicionar membro. Tente novamente.'),
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Select
        label="Nível de Engajamento"
        value={communityType}
        onChange={(e) => {
          setCommunityType(e.target.value as CommunityType | '')
          setErrors({})
          setPrayerGroup('')
          setCell('')
          setName('')
        }}
        options={communityOptions}
        placeholder="Selecione"
        error={errors.communityType}
      />

      {!communityType ? (
        <Select
          label="Célula / Grupo de Oração"
          value=""
          onChange={() => {}}
          options={[]}
          placeholder="Selecione o nível de engajamento primeiro"
          disabled
        />
      ) : isObra ? (
        <Select
          label="Grupo de Oração"
          value={prayerGroup}
          onChange={(e) => { setPrayerGroup(e.target.value); setName('') }}
          options={prayerGroupOptions}
          placeholder={prayerGroupOptions.length === 0 ? 'Nenhum grupo cadastrado' : 'Selecione'}
          disabled={prayerGroupOptions.length === 0}
          error={errors.prayerGroup}
        />
      ) : (
        <Select
          label="Célula ou Grupo de Oração"
          value={cell}
          onChange={(e) => { setCell(e.target.value); setName('') }}
          options={cellOptions}
          placeholder={cellOptions.length === 0 ? 'Nenhuma célula cadastrada' : 'Selecione'}
          disabled={cellOptions.length === 0}
          error={errors.cell}
        />
      )}

      <div className="relative">
        <NameSelect
          options={nameOptions}
          value={name}
          onChange={v => {
            setName(v)
            setErrors(p => ({ ...p, name: '' }))
            const opt = nameOptions.find(o => o.name === v)
            if (opt) {
              if (!communityType) setCommunityType(opt.communityType)
              if (opt.communityType === 'OBRA' && !prayerGroup && opt.groups[0]) setPrayerGroup(opt.groups[0])
              else if ((opt.communityType === 'COMUNIDADE_VIDA' || opt.communityType === 'COMUNIDADE_ALIANCA') && !cell && opt.groups[0]) setCell(opt.groups[0])
            }
          }}
          placeholder={nameOptions.length === 0 ? 'Nenhum membro encontrado' : 'Selecione ou pesquise'}
          error={errors.name}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" loading={isPending}>
          {isEditing ? 'Salvar Alterações' : 'Adicionar Membro'}
        </Button>
      </div>
    </form>
  )
}

import { useState, useRef, useEffect } from 'react'
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
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const selected = options.find(o => o.name === value)

  return (
    <div ref={ref} className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={[
          'block w-full rounded-md border px-3 py-2 text-sm shadow-sm text-left',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          error ? 'border-red-400' : 'border-gray-300',
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white cursor-pointer',
        ].join(' ')}
      >
        {selected ? (
          <span className="flex flex-col">
            <span>{selected.name}</span>
            {selected.teamNames.length > 0 && (
              <span className="text-xs font-medium text-emerald-600">
                Engajado(a): {selected.teamNames.join(' | ')}
              </span>
            )}
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>

      {open && options.length > 0 && (
        <ul className="absolute z-20 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map(opt => (
            <li
              key={opt.name}
              onMouseDown={e => {
                e.preventDefault()
                onChange(opt.name)
                setOpen(false)
              }}
              className={`px-3 py-2.5 cursor-pointer hover:bg-indigo-50 flex flex-col ${value === opt.name ? 'bg-indigo-50' : ''}`}
            >
              <span className="text-sm text-gray-900">{opt.name}</span>
              {opt.teamNames.length > 0 && (
                <span className="text-xs font-medium text-emerald-600">
                  Engajado(a): {opt.teamNames.join(' | ')}
                </span>
              )}
            </li>
          ))}
        </ul>
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
  const groupSelected = isObra ? !!prayerGroup : isCommunity ? !!cell : false

  const cellOptions = cellsWithP.map(c => ({ value: c.name, label: c.category ? `${c.name} — ${c.category}` : c.name }))
  const prayerGroupOptions = prayerGroupsWithP.map(g => ({ value: g.name, label: g.category ? `${g.name} — ${g.category}` : g.name }))

  const participantSuggestions = isObra && prayerGroup
    ? prayerGroupsWithP.find(g => g.name === prayerGroup)?.participants ?? []
    : isCommunity && cell
    ? cellsWithP.find(c => c.name === cell)?.participants ?? []
    : []

  const grouped = new Map<string, string[]>()
  for (const p of participantSuggestions) {
    const teams = grouped.get(p.name) ?? []
    if (p.team && !teams.includes(p.team.name)) teams.push(p.team.name)
    grouped.set(p.name, teams)
  }
  const nameOptions: NameOption[] = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([n, teamNames]) => ({ name: n, teamNames }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'O nome é obrigatório.'
    if (!communityType) errs.communityType = 'Selecione o nível de engajamento.'
    if (isObra && !prayerGroup.trim()) errs.prayerGroup = 'O grupo de oração é obrigatório para Obra.'
    if (isCommunity && !cell.trim()) errs.cell = 'A célula é obrigatória.'
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
          onChange={v => { setName(v); setErrors(p => ({ ...p, name: '' })) }}
          disabled={!communityType || !groupSelected}
          placeholder={
            !communityType ? 'Selecione o nível de engajamento primeiro'
            : !groupSelected ? 'Selecione a célula ou grupo primeiro'
            : nameOptions.length === 0 ? 'Nenhum membro encontrado'
            : 'Selecione'
          }
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

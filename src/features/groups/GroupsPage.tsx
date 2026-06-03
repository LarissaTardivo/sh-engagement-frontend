import { useState } from 'react'
import { Navbar } from '../../shared/components/Navbar'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { Select } from '../../shared/components/Select'
import { Modal } from '../../shared/components/Modal'
import {
  useCellsWithParticipants, useCreateCell, useUpdateCell, useDeleteCell,
  usePrayerGroupsWithParticipants, useCreatePrayerGroup, useUpdatePrayerGroup, useDeletePrayerGroup,
} from './useGroups'
import { createStandaloneParticipant } from '../../shared/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useCreateStandalone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createStandaloneParticipant,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cells', 'withParticipants'] })
      qc.invalidateQueries({ queryKey: ['prayerGroups', 'withParticipants'] })
    },
  })
}
import type { Cell, PrayerGroup, CellWithParticipants, PrayerGroupWithParticipants, CommunityType } from '../../shared/lib/api'

type Item = Cell | PrayerGroup

const communityLabels: Record<CommunityType, string> = {
  OBRA: 'Obra',
  COMUNIDADE_VIDA: 'CV',
  COMUNIDADE_ALIANCA: 'CAL',
}

const communityBadgeClasses: Record<CommunityType, string> = {
  OBRA: 'bg-indigo-100 text-indigo-700',
  COMUNIDADE_VIDA: 'bg-emerald-100 text-emerald-700',
  COMUNIDADE_ALIANCA: 'bg-amber-100 text-amber-700',
}

const CELL_CATEGORIES = [
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'D1', label: 'D1' },
  { value: 'D2/T1', label: 'D2/T1' },
  { value: 'T2/T3', label: 'T2/T3' },
  { value: 'T4/T5', label: 'T4/T5' },
  { value: 'T6/T9', label: 'T6/T9' },
  { value: 'Definitivos 1', label: 'Definitivos 1' },
  { value: 'Definitivos 2', label: 'Definitivos 2' },
]

const PRAYER_GROUP_CATEGORIES = [
  { value: 'Adultos', label: 'Adultos' },
  { value: 'Casais', label: 'Casais' },
  { value: 'Jovens', label: 'Jovens' },
]

function ParticipantsList({ participants }: { participants: { id: string; name: string; communityType: CommunityType; team: { name: string } | null }[] }) {
  if (participants.length === 0) {
    return <p className="px-6 py-3 text-xs text-gray-400 italic">Nenhum membro cadastrado.</p>
  }
  return (
    <ul className="divide-y divide-gray-50 bg-gray-50">
      {participants.map(p => (
        <li key={p.id} className="flex items-center justify-between px-6 py-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold shrink-0">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-800 truncate">{p.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${communityBadgeClasses[p.communityType]}`}>
              {communityLabels[p.communityType]}
            </span>
            {p.team && <span className="text-xs text-gray-400">{p.team.name}</span>}
          </div>
        </li>
      ))}
    </ul>
  )
}

function AddMemberModal({
  open,
  groupName,
  groupType,
  onClose,
}: {
  open: boolean
  groupName: string
  groupType: 'cell' | 'prayerGroup'
  onClose: () => void
}) {
  const create = useCreateStandalone()

  const isObra = groupType === 'prayerGroup'
  const communityOptions = isObra
    ? [{ value: 'OBRA', label: 'Obra' }]
    : [
        { value: 'COMUNIDADE_VIDA', label: 'CV' },
        { value: 'COMUNIDADE_ALIANCA', label: 'CAL' },
      ]

  const [name, setName] = useState('')
  const [communityType, setCommunityType] = useState<CommunityType>(
    isObra ? 'OBRA' : 'COMUNIDADE_VIDA'
  )
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) { setError('O nome é obrigatório.'); return }

    create.mutate(
      {
        name: name.trim(),
        communityType,
        ...(isObra ? { prayerGroup: groupName } : { cell: groupName }),
      },
      {
        onSuccess: () => { setName(''); setError(''); onClose() },
        onError: () => setError('Erro ao cadastrar. Tente novamente.'),
      }
    )
  }

  return (
    <Modal isOpen={open} onClose={onClose} title={`Adicionar membro — ${groupName}`}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        <Input
          label="Nome"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="Nome completo"
          error={error && !name.trim() ? error : undefined}
          autoFocus
        />
        <Select
          label="Nível de Engajamento"
          value={communityType}
          onChange={e => setCommunityType(e.target.value as CommunityType)}
          options={communityOptions}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" onClick={handleSave} loading={create.isPending}>
            Cadastrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function GroupCard({
  item, groupType, onEdit, onDelete, isPendingDelete,
}: {
  item: CellWithParticipants | PrayerGroupWithParticipants
  groupType: 'cell' | 'prayerGroup'
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  isPendingDelete: boolean
}) {
  const [open, setOpen] = useState(false)
  const [addingMember, setAddingMember] = useState(false)

  const engaged = item.participants.filter(p => p.team === null)

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className={`h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-gray-800 truncate">{item.name}</span>
            {item.category && (
              <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                {item.category}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {engaged.length} membro{engaged.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setAddingMember(true)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Adicionar membro"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Editar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(item)}
            disabled={isPendingDelete}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {open && <ParticipantsList participants={engaged} />}
      {addingMember && (
        <AddMemberModal
          open
          groupName={item.name}
          groupType={groupType}
          onClose={() => setAddingMember(false)}
        />
      )}
    </div>
  )
}

function GroupList({
  title, groupType, items, isLoading, onCreate, onEdit, onDelete, isPendingDelete,
}: {
  title: string
  groupType: 'cell' | 'prayerGroup'
  items: (CellWithParticipants | PrayerGroupWithParticipants)[]
  isLoading: boolean
  onCreate: () => void
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
  isPendingDelete: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <Button variant="primary" onClick={onCreate}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <svg className="h-6 w-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <p className="px-6 py-10 text-sm text-gray-400 text-center">Nenhum cadastrado ainda.</p>
      )}

      {!isLoading && items.length > 0 && (
        <div className="p-4 space-y-2">
          {items.map(item => (
            <GroupCard
              key={item.id}
              item={item}
              groupType={groupType}
              onEdit={onEdit}
              onDelete={onDelete}
              isPendingDelete={isPendingDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemModal({
  open, title, initialName, initialCategory, categoryOptions, isPending, onClose, onSave,
}: {
  open: boolean
  title: string
  initialName: string
  initialCategory: string
  categoryOptions: { value: string; label: string }[]
  isPending: boolean
  onClose: () => void
  onSave: (name: string, category: string) => void
}) {
  const [name, setName] = useState(initialName)
  const [category, setCategory] = useState(initialCategory)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSave = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'O nome é obrigatório.'
    if (!category) errs.category = 'Selecione uma categoria.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(name.trim(), category)
  }

  return (
    <Modal isOpen={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <Input
          label="Nome"
          value={name}
          onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
          error={errors.name}
          autoFocus
        />
        <Select
          label="Categoria"
          value={category}
          onChange={e => { setCategory(e.target.value); setErrors(p => ({ ...p, category: '' })) }}
          options={categoryOptions}
          placeholder="Selecione"
          error={errors.category}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" onClick={handleSave} loading={isPending}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function GroupsPage() {
  const { data: cells = [], isLoading: cellsLoading } = useCellsWithParticipants()
  const { data: prayerGroups = [], isLoading: pgLoading } = usePrayerGroupsWithParticipants()

  const createCell = useCreateCell()
  const updateCell = useUpdateCell()
  const deleteCell = useDeleteCell()
  const createPG = useCreatePrayerGroup()
  const updatePG = useUpdatePrayerGroup()
  const deletePG = useDeletePrayerGroup()

  const [modal, setModal] = useState<{ type: 'cell' | 'prayerGroup'; item?: Item } | null>(null)

  const handleDelete = (type: 'cell' | 'prayerGroup', item: Item) => {
    if (!window.confirm(`Excluir "${item.name}"?`)) return
    if (type === 'cell') deleteCell.mutate(item.id)
    else deletePG.mutate(item.id)
  }

  const handleSave = (name: string, category: string) => {
    if (!modal) return
    if (modal.type === 'cell') {
      if (modal.item) updateCell.mutate({ id: modal.item.id, name, category }, { onSuccess: () => setModal(null) })
      else createCell.mutate({ name, category }, { onSuccess: () => setModal(null) })
    } else {
      if (modal.item) updatePG.mutate({ id: modal.item.id, name, category }, { onSuccess: () => setModal(null) })
      else createPG.mutate({ name, category }, { onSuccess: () => setModal(null) })
    }
  }

  const isPending = createCell.isPending || updateCell.isPending || createPG.isPending || updatePG.isPending

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Células e Grupos de Oração</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os grupos e veja os membros de cada um.</p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <GroupList
            title="Células"
            groupType="cell"
            items={cells}
            isLoading={cellsLoading}
            onCreate={() => setModal({ type: 'cell' })}
            onEdit={item => setModal({ type: 'cell', item })}
            onDelete={item => handleDelete('cell', item)}
            isPendingDelete={deleteCell.isPending}
          />
          <GroupList
            title="Grupos de Oração"
            groupType="prayerGroup"
            items={prayerGroups}
            isLoading={pgLoading}
            onCreate={() => setModal({ type: 'prayerGroup' })}
            onEdit={item => setModal({ type: 'prayerGroup', item })}
            onDelete={item => handleDelete('prayerGroup', item)}
            isPendingDelete={deletePG.isPending}
          />
        </div>
      </main>

      {modal && (
        <ItemModal
          open
          title={
            modal.type === 'cell'
              ? (modal.item ? 'Editar Célula' : 'Nova Célula')
              : (modal.item ? 'Editar Grupo de Oração' : 'Novo Grupo de Oração')
          }
          initialName={modal.item?.name ?? ''}
          initialCategory={modal.item?.category ?? ''}
          categoryOptions={modal.type === 'cell' ? CELL_CATEGORIES : PRAYER_GROUP_CATEGORIES}
          isPending={isPending}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

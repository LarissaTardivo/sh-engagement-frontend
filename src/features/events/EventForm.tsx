import { useState } from 'react'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'
import { useCreateEvent, useUpdateEvent } from './useEvents'
import type { Event } from '../../shared/lib/api'

interface EventFormProps {
  onSuccess: () => void
  event?: Event
}

export function EventForm({ onSuccess, event }: EventFormProps) {
  const [name, setName] = useState(event?.name ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [error, setError] = useState<string | null>(null)

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const isPending = createEvent.isPending || updateEvent.isPending
  const isEditing = !!event

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('O nome do evento é obrigatório.')
      return
    }

    const payload = { name: name.trim(), description: description.trim() || undefined }

    if (isEditing) {
      updateEvent.mutate(
        { id: event.id, payload },
        {
          onSuccess: () => onSuccess(),
          onError: () => setError('Erro ao salvar evento. Tente novamente.'),
        }
      )
    } else {
      createEvent.mutate(payload, {
        onSuccess: () => onSuccess(),
        onError: () => setError('Erro ao criar evento. Tente novamente.'),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Input
        label="Nome do evento"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: SVES Jovem - 2026"
        required
        autoFocus
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descreva o evento..."
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" loading={isPending}>
          {isEditing ? 'Salvar Alterações' : 'Criar Evento'}
        </Button>
      </div>
    </form>
  )
}

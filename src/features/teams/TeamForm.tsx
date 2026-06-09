import { useState } from 'react'
import { Input } from '../../shared/components/Input'
import { Button } from '../../shared/components/Button'
import { useCreateTeam, useUpdateTeam } from './useTeams'
import type { Team } from '../../shared/lib/api'

interface TeamFormProps {
  eventId: string
  onSuccess: () => void
  team?: Team
}

export function TeamForm({ eventId, onSuccess, team }: TeamFormProps) {
  const [name, setName] = useState(team?.name ?? '')
  const [coordinatorName, setCoordinatorName] = useState(team?.coordinatorName ?? '')
  const [whatsappLink, setWhatsappLink] = useState(team?.whatsappLink ?? '')
  const [assignments, setAssignments] = useState(team?.assignments ?? '')
  const [error, setError] = useState<string | null>(null)

  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()
  const isPending = createTeam.isPending || updateTeam.isPending
  const isEditing = !!team

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('O nome da equipe é obrigatório.')
      return
    }

    const payload = {
      name: name.trim(),
      coordinatorName: coordinatorName.trim() || undefined,
      whatsappLink: whatsappLink.trim() || undefined,
      assignments: assignments.trim() || undefined,
    }

    if (isEditing) {
      updateTeam.mutate(
        { id: team.id, eventId, payload },
        {
          onSuccess: () => onSuccess(),
          onError: () => setError('Erro ao salvar equipe. Tente novamente.'),
        }
      )
    } else {
      createTeam.mutate(
        { eventId, payload },
        {
          onSuccess: () => onSuccess(),
          onError: () => setError('Erro ao criar equipe. Tente novamente.'),
        }
      )
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
        label="Nome da equipe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Acolhida"
        required
        autoFocus
      />
      <Input
        label="Coordenador"
        value={coordinatorName}
        onChange={(e) => setCoordinatorName(e.target.value)}
        placeholder="Nome do coordenador"
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Atribuições (opcional)
        </label>
        <textarea
          value={assignments}
          onChange={(e) => setAssignments(e.target.value)}
          rows={4}
          placeholder="Descreva as atribuições desta equipe..."
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" loading={isPending}>
          {isEditing ? 'Salvar Alterações' : 'Criar Equipe'}
        </Button>
      </div>
    </form>
  )
}

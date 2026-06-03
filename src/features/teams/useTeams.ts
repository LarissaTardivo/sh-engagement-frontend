import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTeam, getAllTeams, createTeam, updateTeam, deleteTeam } from '../../shared/lib/api'

export function useAllTeams() {
  return useQuery({ queryKey: ['teams', 'all'], queryFn: getAllTeams })
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => getTeam(id),
    enabled: !!id,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string
      payload: { name: string; coordinatorName?: string; whatsappLink?: string }
    }) => createTeam(eventId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      eventId: string
      payload: { name?: string; coordinatorName?: string; whatsappLink?: string }
    }) => updateTeam(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

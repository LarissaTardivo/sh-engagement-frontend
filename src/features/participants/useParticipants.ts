import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createParticipant, updateParticipant, deleteParticipant } from '../../shared/lib/api'
import type { CommunityType } from '../../shared/lib/api'

function invalidateGroups(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['cells', 'withParticipants'] })
  queryClient.invalidateQueries({ queryKey: ['prayerGroups', 'withParticipants'] })
}

export function useCreateParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: string
      payload: { name: string; communityType: CommunityType; prayerGroup?: string; cell?: string }
    }) => createParticipant(teamId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] })
      invalidateGroups(queryClient)
    },
  })
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      teamId: string
      payload: { name?: string; communityType?: CommunityType; prayerGroup?: string; cell?: string }
    }) => updateParticipant(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams', variables.teamId] })
      invalidateGroups(queryClient)
    },
  })
}

export function useDeleteParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteParticipant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      invalidateGroups(queryClient)
    },
  })
}

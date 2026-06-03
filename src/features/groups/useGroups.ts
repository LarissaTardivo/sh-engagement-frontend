import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCells, getCellsWithParticipants, createCell, updateCell, deleteCell,
  getPrayerGroups, getPrayerGroupsWithParticipants, createPrayerGroup, updatePrayerGroup, deletePrayerGroup,
} from '../../shared/lib/api'

export function useCells() {
  return useQuery({ queryKey: ['cells'], queryFn: getCells })
}

export function useCellsWithParticipants() {
  return useQuery({ queryKey: ['cells', 'withParticipants'], queryFn: getCellsWithParticipants })
}

export function useCreateCell() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, category }: { name: string; category: string }) => createCell(name, category),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cells'] }),
  })
}

export function useUpdateCell() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; category?: string }) => updateCell(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cells'] }),
  })
}

export function useDeleteCell() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCell(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cells'] }),
  })
}

export function usePrayerGroups() {
  return useQuery({ queryKey: ['prayerGroups'], queryFn: getPrayerGroups })
}

export function usePrayerGroupsWithParticipants() {
  return useQuery({ queryKey: ['prayerGroups', 'withParticipants'], queryFn: getPrayerGroupsWithParticipants })
}

export function useCreatePrayerGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, category }: { name: string; category: string }) => createPrayerGroup(name, category),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prayerGroups'] }),
  })
}

export function useUpdatePrayerGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; category?: string }) => updatePrayerGroup(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prayerGroups'] }),
  })
}

export function useDeletePrayerGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePrayerGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prayerGroups'] }),
  })
}

import { useQuery } from '@tanstack/react-query'
import { getEvents, searchPublic } from '../../shared/lib/api'

export function usePublicEvents() {
  return useQuery({
    queryKey: ['public', 'events'],
    queryFn: getEvents,
  })
}

export function usePublicSearch(q: string, eventId?: string) {
  return useQuery({
    queryKey: ['public', 'search', q, eventId],
    queryFn: () => searchPublic(q, eventId),
    enabled: true,
  })
}

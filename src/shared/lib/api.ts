import axios from 'axios'

export type CommunityType = 'OBRA' | 'COMUNIDADE_VIDA' | 'COMUNIDADE_ALIANCA'

export interface Event {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export interface Team {
  id: string
  name: string
  coordinatorName?: string | null
  whatsappLink?: string | null
  assignments?: string | null
  eventId: string
  createdAt: string
}

export interface Participant {
  id: string
  name: string
  communityType: CommunityType
  prayerGroup?: string | null
  cell?: string | null
  teamId: string
}

export interface TeamWithParticipants extends Team {
  participants: Participant[]
}

export interface TeamWithCount extends Team {
  _count: { participants: number }
}

export interface EventWithTeams extends Event {
  teams: TeamWithCount[]
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sh_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface CellParticipant {
  id: string
  name: string
  communityType: CommunityType
  team: { name: string; eventId: string } | null
}

export interface Cell {
  id: string
  name: string
  category: string | null
  createdAt: string
}

export interface CellWithParticipants extends Cell {
  participants: CellParticipant[]
}

export interface PrayerGroupParticipant {
  id: string
  name: string
  communityType: CommunityType
  team: { name: string; eventId: string } | null
}

export interface PrayerGroup {
  id: string
  name: string
  category: string | null
  createdAt: string
}

export interface PrayerGroupWithParticipants extends PrayerGroup {
  participants: PrayerGroupParticipant[]
}

// Auth
export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post<{ token: string }>('/auth/login', { email, password })
  return data.token
}

// Events
export async function getEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>('/events')
  return data
}

export async function createEvent(payload: { name: string; description?: string }): Promise<Event> {
  const { data } = await api.post<Event>('/events', payload)
  return data
}

export async function getEvent(id: string): Promise<EventWithTeams> {
  const { data } = await api.get<EventWithTeams>(`/events/${id}`)
  return data
}

export async function updateEvent(id: string, payload: { name?: string; description?: string }): Promise<Event> {
  const { data } = await api.patch<Event>(`/events/${id}`, payload)
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`)
}

// Teams
export async function getTeamsByEvent(eventId: string): Promise<Team[]> {
  const { data } = await api.get<Team[]>(`/events/${eventId}/teams`)
  return data
}

export async function createTeam(
  eventId: string,
  payload: { name: string; coordinatorName?: string; whatsappLink?: string; assignments?: string }
): Promise<Team> {
  const { data } = await api.post<Team>(`/events/${eventId}/teams`, payload)
  return data
}

export async function updateTeam(
  id: string,
  payload: { name?: string; coordinatorName?: string; whatsappLink?: string; assignments?: string }
): Promise<Team> {
  const { data } = await api.patch<Team>(`/teams/${id}`, payload)
  return data
}

export interface TeamWithEvent extends Team {
  event: { name: string }
}

export async function getAllTeams(): Promise<TeamWithEvent[]> {
  const { data } = await api.get<TeamWithEvent[]>('/teams')
  return data
}

export async function getTeam(id: string): Promise<Team & { participants: Participant[] }> {
  const { data } = await api.get<Team & { participants: Participant[] }>(`/teams/${id}`)
  return data
}

export async function deleteTeam(id: string): Promise<void> {
  await api.delete(`/teams/${id}`)
}

// Participants
export async function getParticipantsByTeam(teamId: string): Promise<Participant[]> {
  const { data } = await api.get<Participant[]>(`/teams/${teamId}/participants`)
  return data
}

export async function createParticipant(
  teamId: string,
  payload: {
    name: string
    communityType: CommunityType
    prayerGroup?: string
    cell?: string
  }
): Promise<Participant> {
  const { data } = await api.post<Participant>(`/teams/${teamId}/participants`, payload)
  return data
}

export async function createStandaloneParticipant(payload: {
  name: string
  communityType: CommunityType
  prayerGroup?: string
  cell?: string
}): Promise<Participant> {
  const { data } = await api.post<Participant>('/participants', payload)
  return data
}

export async function updateParticipant(
  id: string,
  payload: { name?: string; communityType?: CommunityType; prayerGroup?: string; cell?: string }
): Promise<Participant> {
  const { data } = await api.patch<Participant>(`/participants/${id}`, payload)
  return data
}

export async function deleteParticipant(id: string): Promise<void> {
  await api.delete(`/participants/${id}`)
}

// Cells
export async function getCells(): Promise<Cell[]> {
  const { data } = await api.get<Cell[]>('/cells')
  return data
}
export async function getCellsWithParticipants(): Promise<CellWithParticipants[]> {
  const { data } = await api.get<CellWithParticipants[]>('/cells/with-participants')
  return data
}
export async function createCell(name: string, category: string): Promise<Cell> {
  const { data } = await api.post<Cell>('/cells', { name, category })
  return data
}
export async function updateCell(id: string, payload: { name?: string; category?: string }): Promise<Cell> {
  const { data } = await api.patch<Cell>(`/cells/${id}`, payload)
  return data
}
export async function deleteCell(id: string): Promise<void> {
  await api.delete(`/cells/${id}`)
}

// Prayer Groups
export async function getPrayerGroups(): Promise<PrayerGroup[]> {
  const { data } = await api.get<PrayerGroup[]>('/prayer-groups')
  return data
}
export async function getPrayerGroupsWithParticipants(): Promise<PrayerGroupWithParticipants[]> {
  const { data } = await api.get<PrayerGroupWithParticipants[]>('/prayer-groups/with-participants')
  return data
}
export async function createPrayerGroup(name: string, category: string): Promise<PrayerGroup> {
  const { data } = await api.post<PrayerGroup>('/prayer-groups', { name, category })
  return data
}
export async function updatePrayerGroup(id: string, payload: { name?: string; category?: string }): Promise<PrayerGroup> {
  const { data } = await api.patch<PrayerGroup>(`/prayer-groups/${id}`, payload)
  return data
}
export async function deletePrayerGroup(id: string): Promise<void> {
  await api.delete(`/prayer-groups/${id}`)
}

// Public search
export async function searchPublic(
  q: string,
  eventId?: string
): Promise<{ teams: TeamWithParticipants[] }> {
  const params: Record<string, string> = { q }
  if (eventId) params.eventId = eventId
  const { data } = await api.get<{ teams: TeamWithParticipants[] }>('/public/search', { params })
  return data
}

export default api

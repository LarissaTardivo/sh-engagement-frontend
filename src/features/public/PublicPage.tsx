import { useState, useEffect, useRef } from 'react'
import { usePublicEvents, usePublicSearch } from './usePublicData'
import { useCellsWithParticipants, usePrayerGroupsWithParticipants } from '../groups/useGroups'
import type { CommunityType, TeamWithParticipants, CellWithParticipants, PrayerGroupWithParticipants } from '../../shared/lib/api'

type SearchType = 'equipe' | 'participante' | 'celula' | 'grupoOracao'

const communityLabels: Record<CommunityType, string> = {
  OBRA: 'Obra',
  COMUNIDADE_VIDA: 'CV',
  COMUNIDADE_ALIANCA: 'CAL',
}

const communityBadgeClasses: Record<CommunityType, string> = {
  OBRA: 'bg-indigo-100 text-indigo-800',
  COMUNIDADE_VIDA: 'bg-emerald-100 text-emerald-800',
  COMUNIDADE_ALIANCA: 'bg-amber-100 text-amber-800',
}

function WhatsAppActions({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
      >
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.843L.073 23.927l6.244-1.418A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.812 9.812 0 01-5.001-1.37l-.359-.214-3.706.843.875-3.6-.234-.371A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
        </svg>
        Entrar no grupo
      </a>
      <span className="text-gray-200">|</span>
      <button
        onClick={() => navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        {copied ? (
          <><svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copiado!</>
        ) : (
          <><svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copiar link</>
        )}
      </button>
    </div>
  )
}

// ── Modal de Atribuições ──────────────────────────────────────────────────────
function AssignmentsModal({ teamName, assignments, onClose }: { teamName: string; assignments: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Atribuições — {teamName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignments}</p>
        </div>
      </div>
    </div>
  )
}

// ── Equipe ────────────────────────────────────────────────────────────────────
function TeamCard({ team }: { team: TeamWithParticipants }) {
  const [showAssignments, setShowAssignments] = useState(false)
  return (
    <>
      {showAssignments && team.assignments && (
        <AssignmentsModal teamName={team.name} assignments={team.assignments} onClose={() => setShowAssignments(false)} />
      )}
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900">{team.name}</h3>
            <p className="text-xs text-gray-500">{team.participants.length} membro{team.participants.length !== 1 ? 's' : ''}</p>
            {team.coordinatorName && <p className="text-xs text-gray-500 mt-0.5">Coord.: {team.coordinatorName}</p>}
          </div>
          {team.assignments && (
            <button
              onClick={() => setShowAssignments(true)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Ver atribuições
            </button>
          )}
        </div>
      </div>
      {team.participants.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">Nenhum membro nesta equipe.</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {team.participants.map(p => (
            <li key={p.id} className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs shrink-0">{p.name.charAt(0).toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  {(p.prayerGroup || p.cell) && (
                    <p className="text-xs text-gray-500 truncate">{p.prayerGroup ? `Grupo: ${p.prayerGroup}` : `Célula: ${p.cell}`}</p>
                  )}
                </div>
              </div>
              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${communityBadgeClasses[p.communityType]}`}>{communityLabels[p.communityType]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  )
}

// ── Participante ──────────────────────────────────────────────────────────────
interface FlatParticipant {
  name: string
  communityType: CommunityType
  prayerGroup?: string | null
  cell?: string | null
  teamNames: string[]
}

function ParticipantCard({ p }: { p: FlatParticipant }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4 min-w-0 overflow-hidden">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">{p.name.charAt(0).toUpperCase()}</div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
          <p className="text-xs text-gray-500 truncate">{p.teamNames.join(' | ')}</p>
          {(p.prayerGroup || p.cell) && (
            <p className="text-xs text-gray-400 truncate">{p.prayerGroup ? `Grupo: ${p.prayerGroup}` : `Célula: ${p.cell}`}</p>
          )}
        </div>
      </div>
      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${communityBadgeClasses[p.communityType]}`}>{communityLabels[p.communityType]}</span>
    </div>
  )
}

// ── Célula / Grupo de Oração ───────────────────────────────────────────────────
function GroupCard({ item }: { item: CellWithParticipants | PrayerGroupWithParticipants }) {
  const engaged = item.participants.filter(p => p.team !== null)

  // Agrupar por nome — mesma pessoa pode estar em várias equipes
  const grouped = new Map<string, { communityType: CommunityType; teams: string[] }>()
  for (const p of engaged) {
    const entry = grouped.get(p.name) ?? { communityType: p.communityType, teams: [] }
    if (!entry.teams.includes(p.team!.name)) entry.teams.push(p.team!.name)
    grouped.set(p.name, entry)
  }
  const members = Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{item.name.charAt(0).toUpperCase()}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              {item.category && (
                <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{item.category}</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{members.length} membro{members.length !== 1 ? 's' : ''} engajado{members.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>
      {members.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-gray-400">Nenhum membro engajado.</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {members.map(([name, { communityType, teams }]) => (
            <li key={name} className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs shrink-0">{name.charAt(0).toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate">{teams.join(' | ')}</p>
                </div>
              </div>
              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${communityBadgeClasses[communityType]}`}>{communityLabels[communityType]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function PublicPage() {
  const [searchType, setSearchType] = useState<SearchType>('equipe')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: events, isLoading: eventsLoading } = usePublicEvents()
  const { data: searchData, isLoading: teamLoading } = usePublicSearch(debouncedQ, selectedEventId || undefined)
  const { data: cells = [], isLoading: cellsLoading } = useCellsWithParticipants()
  const { data: prayerGroups = [], isLoading: pgLoading } = usePrayerGroupsWithParticipants()

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQ(searchInput), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchInput])

  const q = debouncedQ.toLowerCase().trim()

  // Equipe results
  const teams: TeamWithParticipants[] = searchData?.teams ?? []

  // Participante results — agrupar por nome, unir equipes
  const participantMap = new Map<string, FlatParticipant>()
  for (const t of teams) {
    for (const p of t.participants) {
      const existing = participantMap.get(p.name)
      if (existing) {
        if (!existing.teamNames.includes(t.name)) existing.teamNames.push(t.name)
      } else {
        participantMap.set(p.name, {
          name: p.name,
          communityType: p.communityType,
          prayerGroup: p.prayerGroup,
          cell: p.cell,
          teamNames: [t.name],
        })
      }
    }
  }
  const participants: FlatParticipant[] = Array.from(participantMap.values())
    .filter(p => !q || p.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Célula results — filter client-side by query and event
  const filteredCells = cells
    .map(c => ({
      ...c,
      participants: c.participants.filter(p =>
        (!selectedEventId || p.team?.eventId === selectedEventId)
      ),
    }))
    .filter(c =>
      (!q || c.name.toLowerCase().includes(q) || c.participants.some(p => p.name.toLowerCase().includes(q))) &&
      (!selectedEventId || c.participants.length > 0)
    )

  // Grupo de Oração results — filter client-side by query and event
  const filteredGroups = prayerGroups
    .map(g => ({
      ...g,
      participants: g.participants.filter(p =>
        (!selectedEventId || p.team?.eventId === selectedEventId)
      ),
    }))
    .filter(g =>
      (!q || g.name.toLowerCase().includes(q) || g.participants.some(p => p.name.toLowerCase().includes(q))) &&
      (!selectedEventId || g.participants.length > 0)
    )

  const isLoading = searchType === 'equipe' || searchType === 'participante'
    ? teamLoading
    : searchType === 'celula' ? cellsLoading : pgLoading

  const typeLabels: Record<SearchType, string> = {
    equipe: 'equipe', participante: 'membro', celula: 'célula', grupoOracao: 'grupo de oração',
  }

  const resultCount =
    searchType === 'equipe' ? teams.length
    : searchType === 'participante' ? participants.length
    : searchType === 'celula' ? filteredCells.length
    : filteredGroups.length


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            <img src="/sh-icon.png" alt="SH" className="w-9 h-9 rounded-lg object-cover" />
            <h1 className="text-xl font-bold text-gray-600">SH GRU - Engajamento</h1>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-8 px-4 sm:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Encontre seu Engajamento</h2>
          <p className="text-indigo-200 mb-8">Busque por equipe, célula, grupo de oração ou membro</p>

          <div className="bg-white rounded-2xl p-4 shadow-xl space-y-3">
            {/* Tipo de busca */}
            <div className="text-left">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-1">Buscar por</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { value: 'equipe', label: 'Equipe' },
                  { value: 'participante', label: 'Membro' },
                  { value: 'celula', label: 'Célula' },
                  { value: 'grupoOracao', label: 'Grupo de Oração' },
                ] as { value: SearchType; label: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setSearchType(opt.value); setSearchInput(''); setDebouncedQ('') }}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                      searchType === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Evento */}
            <div className="text-left">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-1">Evento</label>
              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                className="block w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={eventsLoading}
              >
                <option value="">Todos os eventos</option>
                {events?.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>

            {/* Busca */}
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={`Buscar ${typeLabels[searchType]}...`}
                className="block w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {isLoading && (
          <div className="flex justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {!isLoading && resultCount === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {q ? 'Nenhum resultado encontrado' : `Nenhum${searchType === 'celula' ? 'a' : ''} ${typeLabels[searchType]} disponível`}
            </h3>
            <p className="text-gray-500 text-sm">
              {q ? 'Tente buscar com outros termos.' : 'Use a busca acima.'}
            </p>
          </div>
        )}

        {!isLoading && resultCount > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-800">{resultCount}</span> {typeLabels[searchType]}{resultCount !== 1 ? 's' : ''} encontrado{resultCount !== 1 ? 's' : ''}
              {q && <span> para <span className="font-semibold text-indigo-600">"{debouncedQ}"</span></span>}
            </p>

            {searchType === 'equipe' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map(t => <TeamCard key={t.id} team={t} />)}
              </div>
            )}

            {searchType === 'participante' && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {participants.map(p => <ParticipantCard key={p.name} p={p} />)}
              </div>
            )}

            {searchType === 'celula' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCells.map(c => <GroupCard key={c.id} item={c} />)}
              </div>
            )}

            {searchType === 'grupoOracao' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGroups.map(g => <GroupCard key={g.id} item={g} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

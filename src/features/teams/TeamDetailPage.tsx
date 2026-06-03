import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Navbar } from '../../shared/components/Navbar'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { ParticipantForm } from '../participants/ParticipantForm'
import { useTeam } from './useTeams'
import { useDeleteParticipant } from '../participants/useParticipants'
import type { CommunityType, Participant } from '../../shared/lib/api'

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

export function TeamDetailPage() {
  const { eventId, teamId } = useParams<{ eventId: string; teamId: string }>()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const { data: team, isLoading, isError } = useTeam(teamId!)
  const deleteParticipant = useDeleteParticipant()
  const queryClient = useQueryClient()

  const registeredGroups = Array.from(new Set((team?.participants ?? []).map((p) => p.prayerGroup).filter(Boolean) as string[])).sort()
  const registeredCells = Array.from(new Set((team?.participants ?? []).map((p) => p.cell).filter(Boolean) as string[])).sort()

  const handleDeleteParticipant = (id: string, name: string) => {
    if (!window.confirm(`Deseja remover "${name}" da equipe? Esta ação não pode ser desfeita.`))
      return
    deleteParticipant.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 flex-wrap">
          <Link to="/admin" className="hover:text-indigo-600 transition-colors">
            Eventos
          </Link>
          <span>/</span>
          <Link to={`/admin/events/${eventId}`} className="hover:text-indigo-600 transition-colors">
            Equipes
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{team?.name ?? '...'}</span>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {isError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center text-red-700">
            Erro ao carregar a equipe. Verifique a conexão com o servidor.
          </div>
        )}

        {team && (
          <>
            {/* Team header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{team.name}</h1>
                  <p className="text-sm text-gray-500">
                    {team.participants.length} membro{team.participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Assignments */}
            {team.assignments && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Atribuições</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{team.assignments}</p>
              </div>
            )}

            {/* Participants section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Membros</h2>
              <Button variant="primary" onClick={() => setAddModalOpen(true)}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Membro
              </Button>
            </div>

            {team.participants.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhum membro</h3>
                <p className="text-gray-500 text-sm">Adicione membros clicando no botão acima.</p>
              </div>
            )}

            {team.participants.length > 0 && (
              <>
                {/* Mobile — cards */}
                <div className="sm:hidden space-y-3">
                  {team.participants.map(p => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                          {(p.prayerGroup || p.cell) && (
                            <p className="text-xs text-gray-500 truncate">{p.prayerGroup ?? p.cell}</p>
                          )}
                          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${communityBadgeClasses[p.communityType]}`}>
                            {communityLabels[p.communityType]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditingParticipant(p)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteParticipant(p.id, p.name)} disabled={deleteParticipant.isPending} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop — tabela */}
                <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nível de Engajamento</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {team.participants.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">{p.name.charAt(0).toUpperCase()}</div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                                {(p.prayerGroup || p.cell) && <p className="text-xs text-gray-500">{p.prayerGroup ?? p.cell}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${communityBadgeClasses[p.communityType]}`}>{communityLabels[p.communityType]}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setEditingParticipant(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar membro">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleDeleteParticipant(p.id, p.name)} disabled={deleteParticipant.isPending} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remover membro">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar Membro">
        <ParticipantForm
          teamId={teamId!}
          registeredGroups={registeredGroups}
          registeredCells={registeredCells}
          onSuccess={() => {
            setAddModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
          }}
        />
      </Modal>

      <Modal isOpen={!!editingParticipant} onClose={() => setEditingParticipant(null)} title="Editar Membro">
        {editingParticipant && (
          <ParticipantForm
            teamId={teamId!}
            participant={editingParticipant}
            registeredGroups={registeredGroups}
            registeredCells={registeredCells}
            onSuccess={() => {
              setEditingParticipant(null)
              queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
            }}
          />
        )}
      </Modal>
    </div>
  )
}

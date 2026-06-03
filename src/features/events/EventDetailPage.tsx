import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '../../shared/components/Navbar'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { TeamForm } from '../teams/TeamForm'
import { useEvent } from './useEvents'
import { useDeleteTeam } from '../teams/useTeams'
import { useQueryClient } from '@tanstack/react-query'
import type { TeamWithCount } from '../../shared/lib/api'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TeamWithCount | null>(null)
  const { data: event, isLoading, isError } = useEvent(id!)
  const deleteTeam = useDeleteTeam()
  const queryClient = useQueryClient()

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (!window.confirm(`Deseja excluir a equipe "${teamName}"? Esta ação não pode ser desfeita.`))
      return
    deleteTeam.mutate(teamId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['events', id] })
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 flex-wrap">
          <Link to="/admin" className="hover:text-indigo-600 transition-colors">
            Eventos
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{event?.name ?? '...'}</span>
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
            Erro ao carregar o evento. Verifique a conexão com o servidor.
          </div>
        )}

        {event && (
          <>
            {/* Event header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{event.name}</h1>
              {event.description && (
                <p className="text-gray-600 mt-2">{event.description}</p>
              )}
            </div>

            {/* Teams section */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Equipes</h2>
                <p className="text-sm text-gray-500">{event.teams.length} equipe{event.teams.length !== 1 ? 's' : ''}</p>
              </div>
              <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Nova Equipe</span>
              </Button>
            </div>

            {event.teams.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                  <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhuma equipe ainda</h3>
                <p className="text-gray-500 text-sm">Crie a primeira equipe clicando em "Nova Equipe".</p>
              </div>
            )}

            {event.teams.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {event.teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
                        </div>
                        {team.coordinatorName && (
                          <p className="text-xs text-gray-500 mt-1 ml-10">
                            Coord.: {team.coordinatorName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingTeam(team)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar equipe"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          disabled={deleteTeam.isPending}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir equipe"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {team._count.participants} pessoa{team._count.participants !== 1 ? 's' : ''} engajada{team._count.participants !== 1 ? 's' : ''}
                      </span>
                      <Link
                        to={`/admin/events/${id}/teams/${team.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Ver membros
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Criar Nova Equipe">
        <TeamForm
          eventId={id!}
          onSuccess={() => {
            setCreateModalOpen(false)
            queryClient.invalidateQueries({ queryKey: ['events', id] })
          }}
        />
      </Modal>

      <Modal isOpen={!!editingTeam} onClose={() => setEditingTeam(null)} title="Editar Equipe">
        {editingTeam && (
          <TeamForm
            eventId={id!}
            team={editingTeam}
            onSuccess={() => {
              setEditingTeam(null)
              queryClient.invalidateQueries({ queryKey: ['events', id] })
            }}
          />
        )}
      </Modal>
    </div>
  )
}

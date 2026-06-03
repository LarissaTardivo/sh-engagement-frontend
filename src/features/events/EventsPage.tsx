import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../shared/components/Navbar'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { EventForm } from './EventForm'
import { useEvents, useDeleteEvent } from './useEvents'
import type { Event } from '../../shared/lib/api'

export function EventsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const { data: events, isLoading, isError } = useEvents()
  const deleteEvent = useDeleteEvent()

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Deseja excluir o evento "${name}"? Esta ação não pode ser desfeita.`))
      return
    deleteEvent.mutate(id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Eventos</h1>
            <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Gerencie os eventos e suas equipes</p>
          </div>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Novo Evento</span>
          </Button>
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
            Erro ao carregar eventos. Verifique a conexão com o servidor.
          </div>
        )}

        {!isLoading && !isError && events?.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
              <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhum evento encontrado</h3>
            <p className="text-gray-500 text-sm">Crie seu primeiro evento clicando em "Novo Evento".</p>
          </div>
        )}

        {events && events.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-base">{event.name}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar evento"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.name)}
                      disabled={deleteEvent.isPending}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir evento"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/admin/events/${event.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Ver equipes
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Criar Novo Evento">
        <EventForm onSuccess={() => setCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} title="Editar Evento">
        {editingEvent && (
          <EventForm event={editingEvent} onSuccess={() => setEditingEvent(null)} />
        )}
      </Modal>
    </div>
  )
}

import { useState, type DragEvent } from 'react'

export function useDragToStatus(onDrop: (id: string, status: string) => void) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStatus, setOverStatus] = useState<string | null>(null)

  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: () => setDraggingId(id),
    onDragEnd: () => {
      setDraggingId(null)
      setOverStatus(null)
    },
  })

  const columnProps = (status: string) => ({
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      setOverStatus(status)
    },
    onDragLeave: () => setOverStatus((s) => (s === status ? null : s)),
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      if (draggingId) onDrop(draggingId, status)
      setDraggingId(null)
      setOverStatus(null)
    },
  })

  return { draggingId, overStatus, dragProps, columnProps }
}

'use client'

import { useEffect } from 'react'

export function DeviceTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('device_id')

      if (!deviceId) {
        // Gera um ID único e persistente para este navegador/dispositivo
        deviceId = crypto.randomUUID()
        localStorage.setItem('device_id', deviceId)
      }
    }
  }, [])

  return null // Este componente não renderiza nada visualmente
}

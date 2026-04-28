'use client'

import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    setIsVisible(true)

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(toast.id), 300)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />
      case 'info':
        return <Info size={20} className="text-blue-500" />
      default:
        return <Info size={20} className="text-gray-500" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg
        min-w-[300px] max-w-md
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getStyles()}
      `}
    >
      {getIcon()}
      <div className="flex-1 text-sm font-medium">
        {toast.message}
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose(toast.id), 300)
        }}
        className="p-1 rounded-md hover:bg-black/10 transition-colors"
      >
        <X size={16} className="opacity-70" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (type: ToastType, message: string, duration?: number) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, type, message, duration }
    
    setToasts((prev) => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (message: string, duration?: number) => addToast('success', message, duration)
  const error = (message: string, duration?: number) => addToast('error', message, duration)
  const warning = (message: string, duration?: number) => addToast('warning', message, duration)
  const info = (message: string, duration?: number) => addToast('info', message, duration)

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}

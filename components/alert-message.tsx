"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, X } from "lucide-react"

type AlertType = "success" | "error" | "warning" | "info"

interface AlertMessageProps {
  type: AlertType
  message: string
  duration?: number
  onClose?: () => void
}

export function AlertMessage({ type, message, duration = 5000, onClose }: AlertMessageProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!visible) return null

  const bgColors = {
    success: "bg-green-50 border-green-500 text-green-700",
    error: "bg-red-50 border-red-500 text-red-700",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-700",
    info: "bg-blue-50 border-blue-500 text-blue-700",
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <AlertCircle className="h-5 w-5 text-blue-500" />,
  }

  return (
    <div className={`p-4 mb-4 rounded-md border ${bgColors[type]} flex items-start`}>
      <div className="mr-3 mt-0.5">{icons[type]}</div>
      <div className="flex-1">{message}</div>
      <button
        onClick={() => {
          setVisible(false)
          if (onClose) onClose()
        }}
        className="ml-3 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

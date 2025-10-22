import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Debug component to show token information (can be removed in production)
export default function TokenDebugger() {
  const { token } = useParams<{ token: string }>()
  const [messageInfo, setMessageInfo] = useState<{title?: string, message?: string} | null>(null)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Listen for message updates to show debug info
  useEffect(() => {
    const handleMessageUpdate = (event: CustomEvent) => {
      setMessageInfo({
        title: event.detail.title,
        message: event.detail.message
      })
    }

    window.addEventListener('messageUpdate', handleMessageUpdate as EventListener)
    return () => window.removeEventListener('messageUpdate', handleMessageUpdate as EventListener)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white text-xs p-3 rounded-lg z-50 max-w-xs">
      <div className="font-bold mb-2">🔍 Debug Info</div>
      <div>Token: {token || 'none'}</div>
      <div>Status: {token ? 'Valid' : 'No token'}</div>
      {messageInfo && (
        <>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="font-semibold">Matched Message:</div>
            <div className="truncate" title={messageInfo.title}>
              Title: {messageInfo.title || 'N/A'}
            </div>
            <div className="truncate" title={messageInfo.message}>
              Message: {messageInfo.message?.substring(0, 50) || 'N/A'}...
            </div>
          </div>
        </>
      )}
    </div>
  )
}

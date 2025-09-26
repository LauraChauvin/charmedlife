import { useParams } from 'react-router-dom'

// Debug component to show token information (can be removed in production)
export default function TokenDebugger() {
  const { token } = useParams<{ token: string }>()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
      <div>Token: {token || 'none'}</div>
      <div>Status: {token ? 'Valid' : 'No token'}</div>
    </div>
  )
}

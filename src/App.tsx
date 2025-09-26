import { Routes, Route, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from './components/LandingPage'
import './index.css'

function AppRoutes() {
  const { token } = useParams<{ token: string }>()

  useEffect(() => {
    // Log token for analytics (as requested)
    if (token) {
      console.log('Token extracted from URL:', token)
      console.log('Token type:', typeof token)
      console.log('Token length:', token.length)
    } else {
      console.log('No token in URL - showing default message')
    }
  }, [token])

  return (
    <>
      <Routes>
        {/* Root path - no token */}
        <Route path="/" element={<LandingPage />} />
        {/* Any token path - all tokens show the same daily message */}
        <Route path="/:token" element={<LandingPage />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppRoutes />
    </div>
  )
}

export default App

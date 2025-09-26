import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import MessageCard from './MessageCard'
import Footer from './Footer'
import TokenDebugger from './TokenDebugger'
import { fetchSheetData, getTodaysMessage, DailyMessage } from '../services/sheetService'

export default function LandingPage() {
  const { token } = useParams<{ token: string }>()
  const [dailyMessage, setDailyMessage] = useState<DailyMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Log token information for analytics
  useEffect(() => {
    if (token) {
      console.log('LandingPage received token:', token)
      console.log('Token validation: Valid (all tokens accepted)')
    }
  }, [token])

  useEffect(() => {
    const loadTodayMessage = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch data from Google Sheets
        const messages = await fetchSheetData()
        
        // Get today's message based on the sheet data
        const todaysMessage = getTodaysMessage(messages)
        
        setDailyMessage(todaysMessage)
        setLoading(false)
      } catch (err) {
        console.error('Error loading message:', err)
        setError('Unable to load today\'s message from Google Sheets. Please check your internet connection and try again later.')
        
        // Fallback message if sheet loading fails
        setDailyMessage({
          date: new Date().toISOString().split('T')[0],
          type: 'Add text over image',
          title: 'Inspiration for Today',
          message: 'Sometimes the best days start with a simple moment of inspiration.',
          mediaURL: '/2.svg',
          cta: 'Visit Our Site',
          link: 'https://www.FootForwardFund.org'
        })
        setLoading(false)
      }
    }

    loadTodayMessage()
  }, [])

  return (
    <div className="min-h-screen flex flex-col safe-area-inset">
      {/* Header with Logo - Mobile Optimized */}
      <header className="flex justify-center py-6 sm:py-8 bg-white shadow-sm sticky top-0 z-10">
        <img 
          src="/logo-blue.png" 
          alt="FootForward Fund" 
          className="h-14 sm:h-16 w-auto object-contain"
        />
      </header>

      {/* Main Content - Responsive */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-md mx-auto w-full min-h-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center script-text">
          Daily Message
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            {dailyMessage && <MessageCard message={dailyMessage} token={token} />}
          </div>
        ) : (
          dailyMessage && <MessageCard message={dailyMessage} token={token} />
        )}
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Token Debugger (development only) */}
      <TokenDebugger />
    </div>
  )
}

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white safe-area-inset">
      {/* Header with Logo - Enhanced Design */}
      <header className="flex justify-center py-8 sm:py-10 bg-white/95 backdrop-blur-md shadow-soft-md sticky top-0 z-20">
        <div className="flex flex-col items-center">
          <img 
            src="/logo-blue.png" 
            alt="FootForward Fund" 
            className="h-16 sm:h-20 w-auto object-contain animate-fade-in"
          />
          <div className="mt-2 text-xs font-script text-gray-600 tracking-wide">
            Spreading inspiration daily
          </div>
        </div>
      </header>

      {/* Main Content - Enhanced Visual Design */}
      <main className="flex-1 px-6 sm:px-8 py-8 sm:py-12 max-w-lg mx-auto w-full min-h-0">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand mb-4 script-text animate-slide-up">
            Daily Inspiration
          </h1>
          <p className="text-gray-600 font-medium">
            Start your day with hope and courage
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand/20 border-t-brand mb-6"></div>
            <p className="text-gray-600 font-medium animate-fade-in">Loading today's inspiration...</p>
          </div>
        ) : error ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 card-shadow border border-red-200">
            <p className="text-red-600 text-center mb-4">{error}</p>
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
